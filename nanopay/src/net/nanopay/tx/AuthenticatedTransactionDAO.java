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
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.IN;
import static foam.mlang.MLang.OR;

public class AuthenticatedTransactionDAO
  extends ProxyDAO
{
  public final static String GLOBAL_TXN_READ = "transaction.read.x";

  public AuthenticatedTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public AuthenticatedTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    User user = (User) x.get("user");
    DAO userDAO = (DAO) x.get("localUserDAO");
    Transaction t = (Transaction) obj;

    if ( user == null ) {
      throw new RuntimeException("User is not logged in");
    }

    // check if you are the payer or if you're doing a money request
    if ( ((Long)t.findSourceAccount(x).getOwner()).longValue() != user.getId() && ! TransactionType.REQUEST.equals(t.getType()) ) {
      throw new RuntimeException("User is not the payer");
    }

    return getDelegate().put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new RuntimeException("User is not logged in");
    }

    Transaction t = (Transaction) getDelegate().find_(x, id);
    if ( t != null && ((Long)t.findDestinationAccount(x).getOwner()).longValue() != user.getId() && ((Long)t.findSourceAccount(x).getOwner()).longValue() != user.getId() && ! auth.check(x, GLOBAL_TXN_READ) ) {
      return null;
    }

    return t;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new RuntimeException("User is not logged in");
    }

    boolean global = auth.check(x, GLOBAL_TXN_READ);
    DAO dao = global ?
      getDelegate() :
      getDelegate().where(
                          OR(
                             IN(Transaction.SOURCE_ACCOUNT, ((ArraySink)user.getAccounts().select(new ArraySink())).getArray()),
                             IN(Transaction.DESTINATION_ACCOUNT, ((ArraySink)user.getAccounts().select(new ArraySink())).getArray())
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
