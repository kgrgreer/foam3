package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.Arrays;
import net.nanopay.model.Broker;
import net.nanopay.tx.model.Fee;
import net.nanopay.tx.model.FeeInterface;
import net.nanopay.tx.model.FixedFee;
import net.nanopay.tx.TransactionDAO;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionType;



public class BrokerFeeTransactionDAO
  extends ProxyDAO
{

  public BrokerFeeTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  public BrokerFeeTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;

    if ( transaction.getBrokerId() == null ) {
      System.out.println("RETURN 1");
      return getDelegate().put_(x, transaction);
    }

    DAO userDAO = (DAO) x.get("localUserDAO");
    DAO brokerDAO = (DAO) x.get("brokerDAO");

    User payee = (User) userDAO.find(transaction.getPayeeId());
    User payer = (User) userDAO.find(transaction.getPayerId());

    Broker broker = (Broker) brokerDAO.find(transaction.getBrokerId());

    if ( broker.getUserId() == null || broker.getFee() == null ) {
      return getDelegate().put_(x, transaction);
    }

    if( broker.getFee() != null && ((FeeInterface) broker.getFee()).getFee(transaction.getAmount()) <= 0 ) {
      return getDelegate().put_(x, transaction);
    }

    //Creating Another transaction for the broker fees
    Transaction brokerTransaction = new Transaction();

    brokerTransaction.setPayeeId((Long) broker.getUserId());

    if ( transaction.getType() == TransactionType.CASHOUT ) {
      brokerTransaction.setPayerId(transaction.getPayerId());
    } else if ( transaction.getType() == TransactionType.CASHIN || transaction.getType() == TransactionType.CASHIN ) {
      brokerTransaction.setPayerId(transaction.getPayeeId());
    } else {
      throw new RuntimeException("Transaction Type is not defined.");
    }

    brokerTransaction.setAmount(((FeeInterface) broker.getFee()).getFee(transaction.getAmount()));

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          DAO tDAO = (DAO) x.get("localTransactionDAO");

          brokerTransaction = (Transaction) tDAO.put(brokerTransaction);

          //Adding the created transaction to the "main" transaction
          transaction.setFeeTransactions(Arrays.append(transaction.getFeeTransactions(), brokerTransaction));

          return getDelegate().put_(x, transaction);

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
}
