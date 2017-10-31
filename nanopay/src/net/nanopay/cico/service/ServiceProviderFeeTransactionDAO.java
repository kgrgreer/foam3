package net.nanopay.cico.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.Arrays;
import net.nanopay.cico.model.ServiceProvider;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.TransactionDAO;
import net.nanopay.tx.model.Fee;
import net.nanopay.tx.model.Transaction;

public class ServiceProviderFeeTransactionDAO
  extends ProxyDAO
{

  public ServiceProviderFeeTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  public ServiceProviderFeeTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;

    X context = x != null ? x : getX();

    System.out.println("getX() :"+getX());
    System.out.println("x from PUT:"+x);

    DAO userDAO = (DAO) context.get("localUserDAO");
    DAO serviceProviderDAO = (DAO) context.get("cicoServiceProviderDAO");

    User payee = (User) userDAO.find(transaction.getPayeeId());
    User payer = (User) userDAO.find(transaction.getPayerId());

    if ( transaction.getProviderId() == null ) {
      return obj;
    }

    ServiceProvider serviceProvider = (ServiceProvider) serviceProviderDAO.find(transaction.getProviderId());

    if ( serviceProvider.getUserId() == null ) {
      throw new RuntimeException("Service Provider has no user defined.");
    }

    if ( serviceProvider.getFee() == null ) {
      throw new RuntimeException("Service Provider has no fee defined.");
    }

    //Creating Another transaction for the broker fees
    Transaction serviceProviderTransaction = new Transaction();

    System.out.println("serviceProvider USER :"+serviceProvider.getUserId());
    serviceProviderTransaction.setPayeeId((Long) serviceProvider.getUserId());

    if ( transaction.getType() == TransactionType.CASHOUT ) {
      serviceProviderTransaction.setPayerId(transaction.getPayerId());
    } else if ( transaction.getType() == TransactionType.CASHIN || transaction.getType() == TransactionType.CASHIN ) {
      serviceProviderTransaction.setPayerId(transaction.getPayeeId());
    } else {
      throw new RuntimeException("Transaction Type is not defined.");
    }
    System.out.println("Transaction PAYER ID :"+transaction.getPayerId());
    System.out.println("Transaction PAYEE ID :"+transaction.getPayeeId());
    System.out.println("serviceProviderTransaction PAYER ID :"+serviceProviderTransaction.getPayerId());
    System.out.println("serviceProviderTransaction PAYEE ID :"+serviceProviderTransaction.getPayeeId());
    Long serviceProviderTransactionFee = ((Fee) serviceProvider.getFee()).getFee(transaction.getAmount());
    System.out.println("SERVICE PROVIDER :"+serviceProvider);
    System.out.println("SERVICE PROVIDER FEE:"+serviceProvider.getFee());
    System.out.println("SERVICE PROVIDER TRANSACTION FEE:"+serviceProviderTransactionFee);
    serviceProviderTransaction.setAmount( serviceProviderTransactionFee > 0 ? serviceProviderTransactionFee : 100);
    System.out.println("serviceProviderTransaction AMOUNT:"+serviceProviderTransaction.getAmount());
    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          DAO tDAO = (DAO) context.get("transactionDAO");
          serviceProviderTransaction = (Transaction) tDAO.put(serviceProviderTransaction);

          //Adding the created transaction to the "main" transaction
          transaction.setFeeTransactions(Arrays.append(transaction.getFeeTransactions(), serviceProviderTransaction));

          return getDelegate().put(transaction);

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
}
