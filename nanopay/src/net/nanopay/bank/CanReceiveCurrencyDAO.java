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

    if ( user == null ) {
      throw new RuntimeException("User not found.");
    }

    if ( user instanceof Contact && ((Contact) user).getBusinessId() > 0 ) {
      User realUser = (User) bareUserDAO.find(((Contact) user).getBusinessId());
      if ( realUser != null ) {
        user = realUser;
      }
    }

    Count count = (Count) accountDAO
      .where(AND(
        INSTANCE_OF(BankAccount.getOwnClassInfo()),
        EQ(BankAccount.DENOMINATION, request.getCurrencyId()),
        EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
        EQ(Account.OWNER, user.getId())))
      .select(new Count());

     // if the user is a business then the compliance should be passed
    boolean isCompliant = !(user instanceof Business) || user.getCompliance().equals(ComplianceStatus.PASSED);

    response.setResponse((count.getValue() > 0) && isCompliant);
    if ( count.getValue() == 0 ) response.setMessage("The user you've chosen is unable to receive money in that currency.");
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
