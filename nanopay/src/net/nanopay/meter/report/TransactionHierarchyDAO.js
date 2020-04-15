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
    'net.nanopay.tx.CompositeTransaction',
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

        // If the id is empty
        if (predicate instanceof True) {
          throw new RuntimeException("The transaction id is empty.");
        }

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
        List<Transaction> childTxnList = new ArrayList<>();

        // If the trasaction id is not valid format or it cannot find transaction
        if (txnList.isEmpty() || txnList.get(0) == null) {
          throw new RuntimeException("Error when trying to find the child transaction of " + id);
        }

        // If it is a one-to-many transactions
        if (txnList.get(0) instanceof CompositeTransaction) {
          txnList.get(0).getChildren(x).select(arraySink_txnList);

          // Iterate through all the compliance transactions
          for (int i = 0; i < arraySink_txnList.getArray().size(); i++) {
            Transaction childTxn = (Transaction) arraySink_txnList.getArray().get(i);
            ArraySink arraySink_digitalTxn = new ArraySink();

            transactionDAO.where(AND(
              EQ(Transaction.PARENT, childTxn.getId()),
              OR(INSTANCE_OF(DigitalTransaction.class), INSTANCE_OF(CITransaction.class), INSTANCE_OF(COTransaction.class))
            )).select(arraySink_digitalTxn);

            // Iterate to get all the digital transactions
            for (int j = 0; j < arraySink_digitalTxn.getArray().size(); j++) {
              Transaction digitalTxn = (Transaction) arraySink_digitalTxn.getArray().get(j);
              childTxnList.add(digitalTxn);

              ArraySink arraySink_CICOTxn = new ArraySink();

              transactionDAO.where(AND(
                EQ(Transaction.PARENT, digitalTxn.getId()),
                OR(INSTANCE_OF(CITransaction.class), INSTANCE_OF(COTransaction.class))
              )).select(arraySink_CICOTxn);

              // Iterate to get all of the cash-in and cash-out transactions
              for (int k = 0; k < arraySink_CICOTxn.getArray().size(); k++) {
                Transaction cicoTxn = (Transaction) arraySink_CICOTxn.getArray().get(j);
                childTxnList.add(cicoTxn);
              }
            }
          }
        } else {
          // If it is a one-to-one transaction
          childTxnList.add(txnList.get(0));
          txnList.get(0).getChildren(x).select(arraySink_txnList);

          if (! arraySink_txnList.getArray().isEmpty() && arraySink_txnList.getArray().get(0) != null) {
            List<Transaction> txnList2 = arraySink_txnList.getArray();
            childTxnList.add(txnList2.get(0));
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
