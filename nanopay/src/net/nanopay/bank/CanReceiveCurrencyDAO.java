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
import foam.nanos.logger.Logger;
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

    // Reusing this service for a liquid requirement:
    // Given an account id return if this is an account-not aggregate - and its currency.
    // will return account selection validity with response.response
    // and denomination in response.message
    if ( request.getAccountChoice() > 0 ) return accountSelectionLookUp(x, request);

    CanReceiveCurrency response = (CanReceiveCurrency) request.fclone();

    User user = (User) bareUserDAO.inX(x).find(request.getUserId());
    // Get business if user is contact.
    user = checkUser(x, user, request.getUserId(), request);
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
    boolean contactRecieveCurrency = (count.getValue() > 0);
  
    response.setResponse(contactRecieveCurrency);
    if ( count.getValue() == 0 ) response.setMessage("We apologize for, this contact is not able to accept " + request.getCurrencyId() + " payments at this time.");
    return response;
  }

  public User checkUser(X x, User user, long id, CanReceiveCurrency request) {
    if ( user == null ) {
      throw new RuntimeException("Warning: User " + id + " was not found.");
    }
    if ( user instanceof Contact ) {
      if ( ((Contact) user).getBusinessId() > 0 ) {
        User realUser = (User) bareUserDAO.find(((Contact) user).getBusinessId());
        if ( realUser != null ) {
          return realUser;
        }
      } else {
        if (request.getUserId() != request.getPayerId()) {
          ((Logger) x.get("logger")).error("Warning: User " + id + " is a contact with no Business Id.");
          return user;
        }
      }
    }
    return user;
  }
  
  public CanReceiveCurrency accountSelectionLookUp(X x, CanReceiveCurrency query) {
    CanReceiveCurrency response = (CanReceiveCurrency) query.fclone();
    response.setResponse(false);
    ArraySink accountSink = (ArraySink) accountDAO.where(AND(
      EQ(net.nanopay.account.Account.DELETED, false),
      EQ(net.nanopay.account.Account.ENABLED, true),
      EQ(net.nanopay.account.Account.ID, query.getAccountChoice()),
      OR(
        AND(
          INSTANCE_OF(net.nanopay.account.DigitalAccount.class),
          NOT(INSTANCE_OF(net.nanopay.account.AggregateAccount.class))
        ),
        INSTANCE_OF(net.nanopay.account.ShadowAccount.class)
      )
    )).select(new ArraySink());

    if ( accountSink.getArray().size() > 0 ) {
      Account account = (Account)accountSink.getArray().get(0);
      response.setResponse(true);
      response.setMessage(account.getDenomination());
    }
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
