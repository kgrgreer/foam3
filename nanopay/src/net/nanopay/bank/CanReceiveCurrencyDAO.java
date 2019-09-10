package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import foam.nanos.auth.AuthService;
import net.nanopay.account.Account;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.contacts.Contact;
import net.nanopay.model.Business;

import static foam.mlang.MLang.*;

/**
 * A standalone DAO that acts like a service. Put an object to it with a user id
 * and a currency and it tells you whether that user has a verified bank account
 * in that currency.
 */
public class CanReceiveCurrencyDAO extends ProxyDAO {
  public DAO userDAO;
  public DAO bareUserDAO;
  public DAO accountDAO;

  public CanReceiveCurrencyDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    bareUserDAO = ((DAO) x.get("bareUserDAO")).inX(x);
    accountDAO = ((DAO) x.get("accountDAO")).inX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj == null ) throw new RuntimeException("Cannot put null.");

    CanReceiveCurrency request = (CanReceiveCurrency) obj;
    CanReceiveCurrency response = (CanReceiveCurrency) request.fclone();

    User user = (User) bareUserDAO.inX(x).find(request.getUserId());
    User payer = (User) bareUserDAO.inX(x).find(request.getPayerId());

    if ( user == null && payer == null) {
      throw new RuntimeException("User not found.");
    }

    if ( user instanceof Contact && ((Contact) user).getBusinessId() > 0 ) {
      User realUser = (User) bareUserDAO.find(((Contact) user).getBusinessId());
      if ( realUser != null ) {
        user = realUser;
      }
    }

    // Checks if the contact has a bank account
    // Needed for a better error message to improve user experience
    Count hasBankAccount = (Count) accountDAO
      .where(AND(
        INSTANCE_OF(BankAccount.getOwnClassInfo()),
        EQ(BankAccount.DELETED, false),
        EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
        EQ(Account.OWNER, user.getId())))
      .select(new Count());

    if ( hasBankAccount.getValue() == 0 ) {
      response.setMessage("Banking information for this contact must be provided.");
      response.setResponse(false);
      return response;
    }

    // Checks if the contact can receive the currency
    Count count = (Count) accountDAO
      .where(AND(
        INSTANCE_OF(BankAccount.getOwnClassInfo()),
        EQ(BankAccount.DELETED, false),
        EQ(BankAccount.DENOMINATION, request.getCurrencyId()),
        EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
        EQ(Account.OWNER, user.getId())))
      .select(new Count());

    // Check payer denomination bank.
    Count payerCount = (Count) accountDAO
      .where(AND(
        INSTANCE_OF(BankAccount.getOwnClassInfo()),
        EQ(BankAccount.DELETED, false),
        EQ(BankAccount.DENOMINATION, request.getCurrencyId()),
        EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
        EQ(Account.OWNER, payer.getId())))
      .select(new Count());

    AuthService auth = (AuthService) x.get("auth");
    boolean fxRequired = request.getCurrencyId().equals("USD") || payerCount.getValue() == 0 || count.getValue() == 0;
    boolean isProvisioned = auth.checkUser(getX(), payer, "currency.read.USD");

     // if the user is a business then the compliance should be passed
    boolean isCompliant = !(user instanceof Business) || user.getCompliance().equals(ComplianceStatus.PASSED);

    response.setResponse(fxRequired ? (count.getValue() > 0) && isCompliant && isProvisioned : (count.getValue() > 0) && isCompliant);
    if ( count.getValue() == 0 ) response.setMessage("Sorry, we don't support " + request.getCurrencyId() + " for this contact.");
    if ( ! isCompliant ) response.setMessage("The user you've chosen hasn't passed our compliance check.");
    return response;
  }

  @Override
  public FObject find_(X x, Object id) {
    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return new ArraySink();
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    return null;
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {}
}
