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
  public BrokerNanopayTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  private static final Long BROKER_ID = 1L;

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;

    if ( transaction.getType() == null ) {
      throw new RuntimeException("Invalid CICO Type");
    }

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {

          switch ( (TransactionType) transaction.getType() ) {
            case CASHOUT :
              transaction.setPayeeId(BROKER_ID);
            case CASHIN :
              transaction.setPayerId(BROKER_ID);
          }

          return getDelegate().put(transaction);

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
}
