package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import net.nanopay.tx.model.Transaction;
import net.nanopay.model.BankAccount;
import static foam.mlang.MLang.*;

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
    User user               = (User) x.get("user");
    Transaction transaction = (Transaction) obj;
    System.out.println("beginning AUTHENTICATION TransactionDAO done");
    if ( user == null ) {
      throw new RuntimeException("User is not logged in");
    }

    DAO userDAO = (DAO) x.get("localUserDAO");

    User payee = (User) userDAO.find(transaction.getPayeeId());
    User payer = (User) userDAO.find(transaction.getPayerId());

    System.out.println("AuthTrans Is Cico???");
    /* is CICO txn? */
    if ( transaction.getPayeeId() == transaction.getPayerId() ) {
      System.out.println("IF AuthTrans Is Cico???");
      // if ( ! isBankAccountFromUser((long) transaction.getBankAccountId(), payee) || ! isBankAccountFromUser((Long) transaction.getBankAccountId(), payer) ) {
      //   throw new RuntimeException("Attempt for user " + payee.getId() + " to create transaction with an unregistered Bank Account");
      // }
    } else {
      System.out.println("payer id:"+transaction.getPayerId());
      System.out.println("payee id:"+transaction.getPayeeId());
      if ( transaction.getPayerId() != user.getId() ) {
        // TODO: log
        System.err.println("Attempt for user " + user.getId() + " to create transaction from " + transaction.getPayerId());
        // TODO: set better message
        throw new RuntimeException("User is not allowed");
      }
    }
    System.out.println("returning AUTHENTICATION TransactionDAO done");
    return getDelegate().put_(x, obj);
  }

  protected boolean isBankAccountFromUser(long bankAccountId, User user) {
    System.out.println("isBankAccountFromUser");
    DAO bankAccountDAO = (DAO) user.getBankAccounts();
    System.out.println("bankAccountDAO:"+bankAccountDAO);
    return bankAccountDAO != null ? bankAccountDAO.find(bankAccountId) != null : false;
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) x.get("user");

    if ( user == null )
      throw new RuntimeException("User is not logged in");

    Transaction t    = (Transaction) getDelegate().find_(x, id);
    AuthService auth = (AuthService) x.get("auth");

    if ( t != null && t.getPayerId() != user.getId() && t.getPayeeId() != user.getId() && ! auth.check(x, GLOBAL_TXN_READ) )
      return null;

    return t;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate)
      throws RuntimeException
  {
    User user = (User) x.get("user");

    if ( user == null )
      throw new RuntimeException("User is not logged in");

    AuthService auth   = (AuthService) x.get("auth");
    boolean     global = auth.check(x, GLOBAL_TXN_READ);

// System.err.println("AuthTxn: " + user.getId() + " " + global);

    DAO dao = global ?
      getDelegate() :
      getDelegate().where(
        OR(
          EQ(Transaction.PAYER_ID, user.getId()),
          EQ(Transaction.PAYEE_ID, user.getId())));

    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove(FObject obj) { return null; }

  @Override
  public void removeAll() { return; }
}
