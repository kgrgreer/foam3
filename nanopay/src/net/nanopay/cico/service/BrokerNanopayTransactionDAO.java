package net.nanopay.cico.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionType;

public class BrokerNanopayTransactionDAO
  extends ProxyDAO
{
  public BrokerNanopayTransactionDAO(X x) {
    this.setX(x);
    this.setOf(net.nanopay.tx.model.Transaction.getOwnClassInfo());
  }

  private static final Long BROKER_ID = 1L;

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {

    DAO transactionDAO = (DAO) getX().get("transactionDAO");
    Transaction transaction = (Transaction) obj;

    if ( transaction.getType() == null ) {
      throw new RuntimeException("Invalid CICO Type");
    }

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {

          // TransactionType type = (TransactionType) transaction.getType();
          switch ( (TransactionType) transaction.getType() ) {
            case CASHOUT :
              transaction.setPayeeId(BROKER_ID);
            case CASHIN :
              transaction.setPayerId(BROKER_ID);
          }

          Transaction completedTransaction = (Transaction) transactionDAO.put(transaction);
          super.put_(x, transaction);
          return completedTransaction;

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
}
