foam.CLASS({
  package: 'net.nanopay.meter.report',
  name: 'PaymentReportDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'A DAO decorator to generate the PaymentReport',

  javaImports: [
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.Constant',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Nary',
    'foam.mlang.predicate.Predicate',
    'net.nanopay.meter.report.PaymentReport',
    'net.nanopay.tx.model.Transaction',

    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        if ( sink == null )
          return super.select_(x, sink, skip, limit, order, predicate);

        Predicate newPredicate = null;

        if ( predicate != null ) {
          if ( predicate instanceof Nary ) {
            newPredicate = AND(
              OR(
                GTE(
                  Transaction.CREATED,
                  ((Constant) ((Gt) ((And) predicate).getArgs()[0]).getArg2()).getValue()
                ),
                GTE(
                  Transaction.PROCESS_DATE,
                  ((Constant) ((Gt) ((And) predicate).getArgs()[0]).getArg2()).getValue()
                ),
                GTE(
                  Transaction.COMPLETION_DATE,
                  ((Constant) ((Gt) ((And) predicate).getArgs()[0]).getArg2()).getValue()
                )
              ),
              LTE(
                Transaction.CREATED,
                ((Constant) ((Lt) ((And) predicate).getArgs()[1]).getArg2()).getValue()
              )
            );
          } else if ( predicate instanceof Gt ) {
            newPredicate = OR(
              GTE(
                Transaction.CREATED,
                ((Constant) ((Gt) predicate).getArg2()).getValue()
              ),
              GTE(
                Transaction.PROCESS_DATE,
                ((Constant) ((Gt) predicate).getArg2()).getValue()
              ),
              GTE(
                Transaction.COMPLETION_DATE,
                ((Constant) ((Gt) predicate).getArg2()).getValue()
              )
            );
          } else {
            newPredicate = LTE(
              Transaction.CREATED,
              ((Constant) ((Lt) predicate).getArg2()).getValue()
            );
          }
        }

        Sink decoratedSink = decorateSink(x, sink, skip, limit, order, null);

        // Retrieve the DAO
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");

        transactionDAO.where(newPredicate).select(new AbstractSink() {
          public void put(Object obj, Detachable sub) {
            Transaction transaction = (Transaction) obj;

            PaymentReport pr = new PaymentReport.Builder(x)
              .setInvoiceId(transaction.getInvoiceId())
              .setStatus(transaction.getStatus())
              .setState(transaction.getState(x))
              .setId(transaction.getId())
              .setReferenceNumber(transaction.getReferenceNumber())
              .setParent(transaction.getParent())
              .setCreated(transaction.getCreated())
              .setProcessDate(transaction.getProcessDate())
              .setCompletionDate(transaction.getCompletionDate())
              .setType(transaction.getType())
              .setSourceAccount(transaction.findSourceAccount(x))
              .setDestinationAccount(transaction.findDestinationAccount(x))
              .setSourceAmount(transaction.getAmount())
              .setSourceCurrency(transaction.getSourceCurrency())
              .setDestinationAmount(transaction.getDestinationAmount())
              .setDestinationCurrency(transaction.getDestinationCurrency())
              .build();

            decoratedSink.put(pr, null);
          }
        });

        return decoratedSink;
      `
    }
  ]
});
