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
  protected DAO userDAO_;
  protected DAO serviceProviderDAO_;

  public ServiceProviderFeeTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public ServiceProviderFeeTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  protected DAO getUserDAO() {
    if ( userDAO_ == null ) {
      userDAO_ = (DAO) getX().get("localUserDAO");
    }
    return userDAO_;
  }

  protected DAO getServiceProviderDAO() {
    if ( serviceProviderDAO_ == null ) {
      serviceProviderDAO_ = (DAO) getX().get("cicoServiceProviderDAO");
    }
    return serviceProviderDAO_;
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;
    User payee = (User) getUserDAO().find(transaction.getPayeeId());
    User payer = (User) getUserDAO().find(transaction.getPayerId());

    if ( transaction.getProviderId() == null ) {
      throw new RuntimeException("Service Provider is not defined.");
    }

    ServiceProvider serviceProvider = (ServiceProvider) getServiceProviderDAO().find(transaction.getProviderId());

    if ( serviceProvider.getUserId() == null ) {
      throw new RuntimeException("Service Provider has no user defined.");
    }

    if ( serviceProvider.getFee() == null ) {
      throw new RuntimeException("Service Provider has no fee defined.");
    }

    //Creating Another transaction for the broker fees
    Transaction serviceProviderTransaction = new Transaction();

    serviceProviderTransaction.setPayeeId((long) serviceProvider.getUserId());

    if ( transaction.getType() == TransactionType.CASHOUT ) {
      serviceProviderTransaction.setPayerId(transaction.getPayerId());
    } else if ( transaction.getType() == TransactionType.CASHIN || transaction.getType() == TransactionType.CASHIN ) {
      serviceProviderTransaction.setPayerId(transaction.getPayeeId());
    } else {
      throw new RuntimeException("Transaction Type is not defined.");
    }


    serviceProviderTransaction.setAmount( ((Fee) serviceProvider.getFee()).getFee(transaction.getAmount()));

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          DAO transactionDAO = (TransactionDAO) x.get("transactionDAO");

          serviceProviderTransaction = (Transaction) transactionDAO.put(serviceProviderTransaction);

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
