package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.Arrays;
import net.nanopay.model.Broker;
import net.nanopay.tx.model.Fee;
import net.nanopay.tx.TransactionDAO;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionType;



public class BrokerFeeTransactionDAO
  extends ProxyDAO
{
  protected DAO userDAO_;
  protected DAO brokerDAO_;

  public BrokerFeeTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public BrokerFeeTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  protected DAO getUserDAO() {
    if ( userDAO_ == null ) {
      userDAO_ = (DAO) getX().get("localUserDAO");
    }
    return userDAO_;
  }

  protected DAO getBrokerDAO() {
    if ( brokerDAO_ == null ) {
      brokerDAO_ = (DAO) getX().get("brokerDAO");
    }
    return brokerDAO_;
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;
    User payee = (User) getUserDAO().find(transaction.getPayeeId());
    User payer = (User) getUserDAO().find(transaction.getPayerId());

    if ( transaction.getBrokerId() == null ) {
      throw new RuntimeException("Broker is not defined.");
    }

    Broker broker = (Broker) getBrokerDAO().find(transaction.getBrokerId());

    if ( broker.getUserId() == null ) {
      throw new RuntimeException("Broker has no user defined.");
    }

    if ( broker.getFee() == null ) {
      throw new RuntimeException("Broker has no fee defined.");
    }

    //Creating Another transaction for the broker fees
    Transaction brokerTransaction = new Transaction();

    brokerTransaction.setPayeeId((long) broker.getUserId());

    if ( transaction.getType() == TransactionType.CASHOUT ) {
      brokerTransaction.setPayerId(transaction.getPayerId());
    } else if ( transaction.getType() == TransactionType.CASHIN || transaction.getType() == TransactionType.CASHIN ) {
      brokerTransaction.setPayerId(transaction.getPayeeId());
    } else {
      throw new RuntimeException("Transaction Type is not defined.");
    }

    brokerTransaction.setAmount( ((Fee) broker.getFee()).getFee(transaction.getAmount()));

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          DAO transactionDAO = (TransactionDAO) x.get("transactionDAO");

          brokerTransaction = (Transaction) transactionDAO.put(brokerTransaction);

          //Adding the created transaction to the "main" transaction
          transaction.setFeeTransactions(Arrays.append(transaction.getFeeTransactions(), brokerTransaction));

          return getDelegate().put(transaction);

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
}
