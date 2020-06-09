package net.nanopay.bank;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.LifecycleState;
import net.nanopay.account.Account;
import net.nanopay.contacts.Contact;


/**
 * A standalone DAO that acts like a service. Put an object to it with a contact
 * object and it will return the default currency of that contact.
 */
public class GetDefaultCurrencyDAO extends ProxyDAO {
  protected DAO accountDAO;
  protected DAO contactDAO;

  public GetDefaultCurrencyDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    accountDAO = ((DAO) x.get("localAccountDAO")).inX(x);
    contactDAO = ((DAO) x.get("contactDAO")).inX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj == null ) throw new RuntimeException("Cannot put null.");

    GetDefaultCurrency request = (GetDefaultCurrency) obj;
    Contact            contact = (Contact) contactDAO.inX(x).find(request.getContactId());
    GetDefaultCurrency response = (GetDefaultCurrency) request.fclone();
    Long id = (contact.getBusinessId() != 0) ? contact.getBusinessId() : contact.getId();

    BankAccount bankAccount = (BankAccount) accountDAO
      .find(
        AND(
          EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
          EQ(Account.DELETED, false),
          EQ(BankAccount.OWNER, id),
          INSTANCE_OF(BankAccount.class),
          EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
        )
      );
    if ( bankAccount != null ) response.setResponse(bankAccount.getDenomination());
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
