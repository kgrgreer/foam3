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
import foam.nanos.logger.Logger;
import foam.util.Auth;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.VerificationTransaction;
import net.nanopay.tx.model.Transaction;

import java.util.List;

import static foam.mlang.MLang.*;

public class AuthenticatedTransactionDAO
  extends ProxyDAO
{
  public final static String GLOBAL_TXN_READ = "transaction.read.*";
  public final static String GLOBAL_TXN_CREATE = "transaction.create.*";
  public final static String GLOBAL_TXN_UPDATE = "transaction.update.*";
  public final static String VERIFICATION_TXN_READ = "verificationtransaction.read.*";

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
    Logger logger = (Logger) x.get("logger");

    if ( user == null ) {
      logger.warning("User not found for " + t.getId());
      throw new AuthenticationException();
    }

    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
    DAO bareUserDAO = ((DAO) x.get("bareUserDAO")).inX(x);
    //AuthService auth = (AuthService) x.get("auth");
    Account sourceAccount = t.findSourceAccount(x);
    Account destinationAccount = t.findDestinationAccount(x);
    Invoice inv = (Invoice) invoiceDAO.find(t.getInvoiceId());
    User invPayee;
    boolean isSourceAccountOwner = sourceAccount != null && sourceAccount.getOwner() == user.getId();
    boolean isPayer = sourceAccount != null ? sourceAccount.getOwner() == user.getId() : t.getPayerId() == user.getId();
    boolean isPayee = destinationAccount != null ? destinationAccount.getOwner() == user.getId() : t.getPayeeId() == user.getId();
    boolean isAcceptingPaymentFromPayersDigitalAccount = sourceAccount instanceof DigitalAccount && auth.check(x, "invoice.holdingAccount");
    boolean isCreatePermitted = auth.check(x, GLOBAL_TXN_CREATE);
    boolean isUpdatePermitted = auth.check(x, GLOBAL_TXN_UPDATE);

    if ( ! ( isSourceAccountOwner || isPayer || isAcceptingPaymentFromPayersDigitalAccount
    || t instanceof CITransaction && isPayee ) ) {

      /**
       * here we are handling two cases:
       * 1. if an update was made (oldTxn != null), check update perms
       * 2. if a creation was made (oldTxn == null), check creation perms
       */
      if ( oldTxn != null && ! isUpdatePermitted || oldTxn == null && ! isCreatePermitted  ) {
        logger.warning("Permission denied for " + t.getId() + " or " + t.getId());
        throw new AuthorizationException();
      }
    }

    if ( t.getInvoiceId() != 0 ) {
      Invoice invoice = (Invoice) invoiceDAO.find(t.getInvoiceId());

      if ( invoice == null ) {
        logger.error("the invoice associated with this transaction could not be found for transaction" + t.getId());
        throw new RuntimeException("The invoice associated with this transaction could not be found.");
      }

      if ( invoice.getPayerId() != user.getId() && ! isAcceptingPaymentFromPayersDigitalAccount ) {
        if ( oldTxn == null ) {
          logger.error("You cannot pay a receivable " + t.getId());
          throw new AuthorizationException("You cannot pay a receivable.");
        }
        else if ( ! isUpdatePermitted ) {
          logger.error("You cannot update a receivable " + t.getId());
          throw new AuthorizationException("You cannot update a receivable.");
        }
      }

      if ( invoice.getDraft() ) {
        logger.error("You cannot pay a draft " + t.getId());
        throw new AuthorizationException("You cannot pay draft invoices.");
      }

      if ( ! auth.check(x, "invoice.pay") ) {
        invoice = (Invoice) invoice.fclone();
        invoice.setPaymentMethod(PaymentStatus.PENDING_APPROVAL);
        invoiceDAO.put(invoice);
        return null;
      }
    }

    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      ((Logger) x.get("logger")).error("User not found in authenicatedTransactionDAO find_");
      throw new AuthenticationException();
    }

    Transaction t = (Transaction) getDelegate().find_(getX(), id);
    if ( t == null ) {
      return t;
    }

    Logger logger = (Logger) x.get("logger");
    Account destinationAccount = t.findDestinationAccount(x);
    if ( destinationAccount == null ) {
      logger.error(this.getClass().getSimpleName(), id, "destination account", t.getDestinationAccount(), "not found.", t);
    }
    Account sourceAccount = t.findSourceAccount(x);
    if ( sourceAccount == null ) {
      logger.error(this.getClass().getSimpleName(), id, "source account", t.getSourceAccount(), "not found.", t);
    }
    logger.error(this.getClass().getSimpleName(), id, "user", (user == null) ? "null" : user.getId());

    if ( t != null && t.findDestinationAccount(x).getOwner() != user.getId() && t.findSourceAccount(x).getOwner() != user.getId() && ! auth.check(x, GLOBAL_TXN_READ) ) {
      return null;
    }
    return t;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    DAO dao;
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      ((Logger) x.get("logger")).error("User not found in authenicatedTransactionDAO select_");
      throw new AuthenticationException();
    }

    if ( auth.check(x, GLOBAL_TXN_READ) ) {
      dao = getDelegate();
    } else {
      foam.mlang.sink.Map map = new foam.mlang.sink.Map.Builder(x)
        .setArg1(Account.ID)
        .setDelegate(new ArraySink())
        .build();
      DAO localAccountDAO = ((DAO) x.get("localAccountDAO")).inX(x);
      localAccountDAO.where(EQ(Account.OWNER, user.getId())).select(map);
      List ids = ((ArraySink) map.getDelegate()).getArray();
      dao = getDelegate().where(
        OR(
          IN(Transaction.SOURCE_ACCOUNT, ids),
          IN(Transaction.DESTINATION_ACCOUNT, ids)
        ));
    }

    dao = auth.check(x, VERIFICATION_TXN_READ)
      ? dao
      : dao.where(NOT(INSTANCE_OF(VerificationTransaction.class)));

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
