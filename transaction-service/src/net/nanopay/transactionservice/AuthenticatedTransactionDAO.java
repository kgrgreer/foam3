package net.nanopay.transactionservice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.common.model.User;
import net.nanopay.transactionservice.model.Transaction;

//TODO:Change print statements to throw exceptions when they are ready
public class AuthenticatedTransactionDAO
  extends ProxyDAO
{
  public AuthenticatedTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user               = (User) x.get("user");
    Transaction transaction = (Transaction) obj;

    if ( user == null ) {
      System.out.println("User is not logged in");
      return null;
    }

    if ( transaction.getPayerId() != user.getId() ) {
      System.out.println("User is not allowed");
      return null;
    }

    return getDelegate().put(obj);
  }
}
