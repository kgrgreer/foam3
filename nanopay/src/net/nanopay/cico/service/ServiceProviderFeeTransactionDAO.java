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
import net.nanopay.tx.model.FeeInterface;
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

    if ( transaction.getProviderId() == null ) {
      return getDelegate().put_(x, transaction);
    }

    DAO userDAO = (DAO) x.get("localUserDAO");
    DAO serviceProviderDAO = (DAO) x.get("cicoServiceProviderDAO");

    User payee = (User) userDAO.find(transaction.getPayeeId());
    User payer = (User) userDAO.find(transaction.getPayerId());

    ServiceProvider serviceProvider = (ServiceProvider) serviceProviderDAO.find(transaction.getProviderId());

    if ( serviceProvider.getUserId() == null || serviceProvider.getFee() == null ) {
      return getDelegate().put_(x, transaction);
    }

    if( serviceProvider.getFee() != null && ((FeeInterface) serviceProvider.getFee()).getFee(transaction.getAmount()) <= 0 ) {
      return getDelegate().put_(x, transaction);
    }

    //Creating Another transaction for the broker fees
    Transaction serviceProviderTransaction = new Transaction();

    serviceProviderTransaction.setPayeeId((Long) serviceProvider.getUserId());

    if ( transaction.getType() == TransactionType.CASHOUT ) {
      serviceProviderTransaction.setPayerId(transaction.getPayerId());
    } else if ( transaction.getType() == TransactionType.CASHIN || transaction.getType() == TransactionType.CASHIN ) {
      serviceProviderTransaction.setPayerId(transaction.getPayeeId());
    } else {
      throw new RuntimeException("Transaction Type is not defined.");
    }

    serviceProviderTransaction.setAmount( ((FeeInterface) serviceProvider.getFee()).getFee(transaction.getAmount()) );

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          DAO tDAO = (DAO) x.get("localTransactionDAO");
          serviceProviderTransaction = (Transaction) tDAO.put(serviceProviderTransaction);

          //Adding the created transaction to the "main" transaction
          transaction.setFeeTransactions(Arrays.append(transaction.getFeeTransactions(), serviceProviderTransaction));

          return getDelegate().put_(x, transaction);

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
}
