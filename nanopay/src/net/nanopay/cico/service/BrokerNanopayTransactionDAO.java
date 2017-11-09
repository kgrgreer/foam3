package net.nanopay.cico.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.model.Broker;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionType;

public class BrokerNanopayTransactionDAO
  extends ProxyDAO
{
  public BrokerNanopayTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }
  public BrokerNanopayTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }
  private static final Long BROKER_ID = 1L;

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;

    if ( transaction.getType() == null ) {
      throw new RuntimeException("Invalid CICO Type");
    }

    DAO brokerDAO = (DAO) x.get("brokerDAO");
    Broker broker = (Broker) brokerDAO.find(BROKER_ID);

    if ( broker == null || broker.getUserId() == null ) {
      throw new RuntimeException("Broker User not defined");
    }

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {

          transaction.setBrokerId(BROKER_ID);

          switch ( (TransactionType) transaction.getType() ) {
            case CASHOUT :
              transaction.setPayeeId((Long) broker.getUserId());
              break;
            case CASHIN :
              transaction.setPayerId((Long) broker.getUserId());
              break;
            default :
              System.out.println("Transaction Type not Cashout or Cashin.");
          }

          return getDelegate().put_(x, transaction);

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
}
