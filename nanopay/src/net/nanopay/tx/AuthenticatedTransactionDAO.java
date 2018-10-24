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
import net.nanopay.account.HoldingAccount;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.tx.model.Transaction;

import java.util.List;

import static foam.mlang.MLang.IN;
import static foam.mlang.MLang.OR;

public class AuthenticatedTransactionDAO
  extends ProxyDAO
{
  public final static String GLOBAL_TXN_READ = "transaction.read.*";
  public final static String GLOBAL_TXN_CREATE = "transaction.create.*";

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
    AuthService auth = (AuthService) x.get("auth");
    Transaction t = (Transaction) obj;
    Transaction oldTxn = (Transaction) super.find_(x, obj);

    if ( user == null ) {
      throw new AuthenticationException();
    }

    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
    DAO bareUserDAO = ((DAO) x.get("bareUserDAO")).inX(x);

    Account sourceAccount = t.findSourceAccount(x);
    Invoice inv;
    User payee;
    boolean isSourceAccountOwner = sourceAccount != null && sourceAccount.getOwner() == user.getId();
    boolean isPayer = sourceAccount != null ? sourceAccount.getOwner() == user.getId() : t.getPayerId() == user.getId();
    boolean isAcceptingPaymentSentToContact = sourceAccount instanceof HoldingAccount &&
      (inv = (Invoice) invoiceDAO.find(((HoldingAccount) sourceAccount).getInvoiceId())) != null &&
      (payee = (User) bareUserDAO.find(inv.getPayeeId())) != null &&
      SafetyUtil.equals(payee.getEmail(), user.getEmail());
    boolean isPermitted = auth.check(x, GLOBAL_TXN_CREATE);

    if ( ! ( isSourceAccountOwner || isPayer || isAcceptingPaymentSentToContact || isPermitted ) ) {
      throw new AuthorizationException();
    }

    // Only allow users to pay for invoices in the PENDING_APPROVAL state if
    // they have the appropriate permission.
    if ( t.getInvoiceId() != 0 && ! auth.check(x, "invoice.pay") ) {
      throw new AuthorizationException("You do not have permission to pay this invoice.");
    }

    return super.put_(x, obj);
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
