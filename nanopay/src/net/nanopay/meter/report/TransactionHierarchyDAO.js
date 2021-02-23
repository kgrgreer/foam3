/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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

        try {
          String id = (String) ((Constant)((Eq)((And) predicate).getArgs()[1]).getArg2()).getValue();
          Transaction transaction = (Transaction) transactionDAO.find(id);

          TransactionReport transactionDetail = new TransactionReport();
          transactionDetail.setId(transaction.getId());
          transactionDetail.setType(transaction.getType());
          transactionDetail.setAmount(Long.toString(-transaction.getTotal(x, transaction.getSourceAccount())));
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

          // If the trasaction id is not valid format or it cannot find transaction
          if (txnList.isEmpty() || txnList.get(0) == null) {
            throw new RuntimeException("Error when trying to find the child transaction of " + id);
          }

          ArraySink arraySink_txnList = new ArraySink();
          List<Transaction> childTxnList = new ArrayList<>();

          if (txnList.get(0) instanceof CITransaction) {
            txnList.get(0).getChildren(x).select(arraySink_txnList);
            childTxnList.add(txnList.get(0));

            Transaction nextTxn = (Transaction) arraySink_txnList.getArray().get(0);
            txnList.set(0, nextTxn);
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
            // If it is a one-to-one transaction,
            // iterate throw the transaction chain to find digital and CICO transaction
            while (txnList.get(0) != null) {
              ArraySink oneToOneSink = new ArraySink();
              txnList.get(0).getChildren(x).select(oneToOneSink);
              if ( oneToOneSink.getArray().size() > 0 ) {
                Transaction txn = (Transaction) oneToOneSink.getArray().get(0);
                txnList.set(0, txn);

                if (txn instanceof CITransaction || txn instanceof COTransaction || txn instanceof DigitalTransaction ) {
                  childTxnList.add(txn);
                }
              } else {
                txnList.set(0, null);
              }
            }
          }

          transactionDetail.setChildTransaction(childTxnList.toArray(new Transaction[childTxnList.size()]));

          Sink decoratedSink = decorateSink(x, sink, skip, limit, order, null);
          decoratedSink.put(transactionDetail, null);

          return decoratedSink;
        } catch(ClassCastException e) {
          // If the id is empty
          throw new RuntimeException("The transaction id is empty.");
        } catch(NullPointerException e) {
          // If the id is not valid
          throw new RuntimeException("The transaction id is not valid.");
        }
      `
    }
  ]
});
