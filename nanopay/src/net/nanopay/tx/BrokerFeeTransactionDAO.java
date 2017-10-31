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

    X context = x != null ? x : getX();

    System.out.println("getX() :"+getX());
    System.out.println("x from PUT:"+x);

    DAO userDAO = (DAO) context.get("localUserDAO");
    DAO brokerDAO = (DAO) context.get("brokerDAO");

    User payee = (User) userDAO.find(transaction.getPayeeId());
    User payer = (User) userDAO.find(transaction.getPayerId());

    if ( transaction.getBrokerId() == null ) {
      return obj;
    }

    Broker broker = (Broker) brokerDAO.find(transaction.getBrokerId());

    if ( broker.getUserId() == null ) {
      throw new RuntimeException("Broker has no user defined.");
    }

    if ( broker.getFee() == null ) {
      throw new RuntimeException("Broker has no fee defined.");
    }

    //Creating Another transaction for the broker fees
    Transaction brokerTransaction = new Transaction();

    System.out.println("BROKER USER :"+broker.getUserId());
    brokerTransaction.setPayeeId((Long) broker.getUserId());

    if ( transaction.getType() == TransactionType.CASHOUT ) {
      brokerTransaction.setPayerId(transaction.getPayerId());
    } else if ( transaction.getType() == TransactionType.CASHIN || transaction.getType() == TransactionType.CASHIN ) {
      brokerTransaction.setPayerId(transaction.getPayeeId());
    } else {
      throw new RuntimeException("Transaction Type is not defined.");
    }
    System.out.println("Transaction PAYER ID :"+transaction.getPayerId());
    System.out.println("Transaction PAYEE ID :"+transaction.getPayeeId());
    System.out.println("BROKER TRANSACTION PAYER ID :"+brokerTransaction.getPayerId());
    System.out.println("BROKER TRANSACTION PAYEE ID :"+brokerTransaction.getPayeeId());

    long brokerTransactionFee = ((Fee) broker.getFee()).getFee(transaction.getAmount());
    System.out.println("BROKER :"+broker);
    System.out.println("BROKER FEE:"+broker.getFee());
    System.out.println("Broker TRANSACTION FEE:"+brokerTransactionFee);
    brokerTransaction.setAmount( brokerTransactionFee > 0 ? brokerTransactionFee : 100);
    System.out.println("Broker TRANSACTION AMOUNT:"+brokerTransaction.getAmount());
    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          DAO tDAO = (DAO) context.get("transactionDAO");

          brokerTransaction = (Transaction) tDAO.put(brokerTransaction);

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
