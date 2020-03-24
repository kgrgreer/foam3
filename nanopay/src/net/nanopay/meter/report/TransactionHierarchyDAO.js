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
    'foam.dao.Sink',
    'static foam.mlang.MLang.*',
    'foam.mlang.Constant',
    'foam.mlang.predicate.*',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'java.util.List',
    'java.util.ArrayList'
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");
        String id = (String) ((Constant)((Eq)((And) predicate).getArgs()[1]).getArg2()).getValue();
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

        transactionDAO.where(
          EQ(Transaction.PARENT, id)
        ).select(txnSink);

        List<Transaction> txnList = txnSink.getArray();
        ArraySink arraySink_txnList = new ArraySink();
        txnList.get(0).getChildren(x).select(arraySink_txnList);

        List<Transaction> childTxnList = new ArrayList<>();

        for (int i = 0; i < arraySink_txnList.getArray().size(); i++) {
          Transaction childTxn = (Transaction) arraySink_txnList.getArray().get(i);
          ArraySink arraySink_childTxn = new ArraySink();

          transactionDAO.where(AND(
            EQ(Transaction.PARENT, childTxn.getId()),
            OR(INSTANCE_OF(DigitalTransaction.class), INSTANCE_OF(CITransaction.class), INSTANCE_OF(COTransaction.class))
          )).select(arraySink_childTxn);

          for (int j = 0; j< arraySink_childTxn.getArray().size(); j++) {
            childTxnList.add((Transaction) arraySink_childTxn.getArray().get(j));
          }
        }

        transactionDetail.setChildTransaction(childTxnList.toArray(new Transaction[childTxnList.size()]));

        Sink decoratedSink = decorateSink(x, sink, skip, limit, order, null);
        decoratedSink.put(transactionDetail, null);

        return decoratedSink;
      `
    }
  ]
});
