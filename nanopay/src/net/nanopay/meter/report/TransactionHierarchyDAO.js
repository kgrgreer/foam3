foam.CLASS({
  package: 'net.nanopay.meter.report',
  name: 'TransactionHierarchyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: '',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*',
    'foam.mlang.Constant',
    'foam.mlang.predicate.*',
    'java.util.List',
    'foam.dao.Sink'
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");

        String id = (String) ((Constant)((Eq)((And)((Or) predicate).getArgs()[0]).getArgs()[0]).getArg2()).getValue();
        
        // This is for testing purpose only, it will be removed before merge
        // String id = "448ff913-ca39-e78c-daec-9f6fb971e74c";
        Transaction transaction = (Transaction) transactionDAO.find(id);

        TransactionReport transactionDetail = new TransactionReport();
        transactionDetail.setId(transaction.getId());
        transactionDetail.setType(transaction.getType());
        transactionDetail.setAmount(Long.toString(transaction.getAmount()));
        transactionDetail.setCreated(transaction.getCreated());
        transactionDetail.setPayeeId(transaction.getPayeeId());
        transactionDetail.setPayerId(transaction.getPayerId());
        transactionDetail.setFee(Long.toString(transaction.getCost()));
        transactionDetail.setStatus(transaction.getStatus());

        ArraySink txnSink = new ArraySink();

        transactionDAO.where(AND(
            EQ(Transaction.PARENT, id),
            OR(INSTANCE_OF(DigitalTransaction.class), INSTANCE_OF(CITransaction.class), INSTANCE_OF(COTransaction.class))
        )).select(txnSink);

        List<Transaction> txnList = txnSink.getArray();

        transactionDetail.setChildTransaction(txnList.toArray(new Transaction[txnList.size()]));

        Sink decoratedSink = decorateSink(x, sink, skip, limit, order, null);
        decoratedSink.put(transactionDetail, null);

        return decoratedSink;
      `
    }
  ]
});
