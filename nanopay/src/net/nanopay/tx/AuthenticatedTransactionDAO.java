package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.dao.ArraySink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.model.Transaction;

import java.util.List;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.IN;
import static foam.mlang.MLang.OR;

public class AuthenticatedTransactionDAO
  extends ProxyDAO
{
  public final static String GLOBAL_TXN_READ = "transaction.read.*";

  public AuthenticatedTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public AuthenticatedTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    DAO userDAO = (DAO) x.get("localUserDAO");
    Transaction t = (Transaction) obj;
    Transaction oldTxn = (Transaction) getDelegate().find(obj);

    if ( user == null ) {
      throw new AuthenticationException();
    }

    // check if you are the payer or if you're doing a money request
    if ( t.findSourceAccount(x) != null ) {
      if (((Long) t.findSourceAccount(x).getOwner()).longValue() != user.getId() && !TransactionType.REQUEST.equals(t.getType()) && oldTxn == null) {
        throw new AuthorizationException("Permission denied. User is not the payer.");
      }
    } else if (((Long) t.getPayerId()).longValue() != user.getId() && !TransactionType.REQUEST.equals(t.getType()) && oldTxn == null) {
      throw new AuthorizationException("Permission denied. User is not the payer.");
    }

    return getDelegate().put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    Transaction t = (Transaction) getDelegate().find_(x, id);
    if ( t != null && t.findDestinationAccount(x).getOwner() != user.getId() && t.findSourceAccount(x).getOwner() != user.getId() && ! auth.check(x, GLOBAL_TXN_READ) ) {
      return null;
    }

    return t;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    boolean global = auth.check(x, GLOBAL_TXN_READ);

    ArraySink arraySink = (ArraySink) user.getAccounts(x).select(new ArraySink());
    List accountsArray =  arraySink.getArray();
    Long[] ids = new Long[accountsArray.size()];
    for (int i =0; i < accountsArray.size(); i++)
      ids[i] = ((Account)accountsArray.get(i)).getId();
    DAO dao = global ?
      getDelegate() :
      getDelegate().where(
                          OR(
                             IN(Transaction.SOURCE_ACCOUNT, ids),
                             IN(Transaction.DESTINATION_ACCOUNT, ids)
                             )
                          );
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove(FObject obj) {
    return null;
  }

  @Override
  public void removeAll() {

  }
}
