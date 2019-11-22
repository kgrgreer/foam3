package net.nanopay.contacts;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.accounting.quickbooks.model.QuickbooksContact;
import net.nanopay.accounting.xero.model.XeroContact;

import static foam.mlang.MLang.*;

/**
 * When adding a contact by email, check if a User already exists with that
 * email address. If so, throw an error. The client will catch it let the user
 * know that they have to pick that user's company from the list of companies.
 */
public class CheckContactExistsDAO extends ProxyDAO {
  public DAO localUserUserDAO_;

  public CheckContactExistsDAO(X x, DAO delegate) {
    super(x, delegate);
    localUserUserDAO_ = ((DAO) x.get("localUserUserDAO")).inX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // Contact contact = (Contact) obj;

    // if ( contact == null ) {
    //   throw new RuntimeException("Cannot put null!");
    // }

    // // We only want to do this check for newly created Contacts.
    // if ( super.find_(x, obj) != null || contact.getBusinessId() != 0 || obj instanceof QuickbooksContact || obj instanceof XeroContact) {
    //   return super.put_(x, obj);
    // }

    // // The user is adding a contact by choosing an existing business instead of
    // // putting in an email address. There's no need to check anything in this
    // // case.
    // if ( SafetyUtil.isEmpty(contact.getEmail()) ) {
    //   return super.put_(x, obj);
    // }

    // User existingUser = (User) localUserUserDAO_.find(EQ(User.EMAIL, contact.getEmail()));

    // if ( existingUser != null ) {
    //   throw new RuntimeException("A user with that email address is already using Ablii. To add their business as a contact, select it from the list of businesses.");
    // }

    return super.put_(x, obj);
  }
}
