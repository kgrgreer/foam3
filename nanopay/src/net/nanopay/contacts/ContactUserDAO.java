package net.nanopay.contacts;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;

import java.util.List;

import static foam.mlang.MLang.EQ;

/**
 * The purpose of this DAO decorator is to create a User to associate with a
 * Contact if there is no existing User with the email address set on the
 * Contact.
 */
public class ContactUserDAO extends ProxyDAO {
  public ContactUserDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Contact toPut = (Contact) obj;
    DAO localUserDAO = (DAO) x.get("localUserDAO");

    if ( toPut == null ) {
      throw new RuntimeException("Cannot put null.");
    } else if ( SafetyUtil.isEmpty(toPut.getEmail()) ) {
      throw new RuntimeException("Please provide an email address.");
    }

    Sink sink = new ArraySink();
    sink = localUserDAO
      .where(EQ(User.EMAIL, toPut.getEmail().toLowerCase()))
      .limit(1)
      .select(sink);
    List data = ((ArraySink) sink).getArray();

    if ( data.size() != 1 ) {
      // Case 1: The email address on the contact is not taken by an existing user.
      User newUser = new User();
      newUser.setEmail(toPut.getEmail());
      newUser.setFirstName(toPut.getFirstName());
      newUser.setLastName(toPut.getLastName());
      newUser.setType("Contact");
      try {
        newUser = (User) localUserDAO.put_(x, newUser);
        toPut.setUserId(newUser.getId());
      } catch (Throwable t) {
        throw new RuntimeException("Couldn't create a new user for email address: '" + toPut.getEmail() + "'. Got the following error: " + t.getMessage(), t);
      }
    } else {
      User existingUser = (User) data.get(0);
      if ( SafetyUtil.equals(existingUser.getType(), "Contact") ||  SafetyUtil.equals(existingUser.getType(), "Business") ) {
        // Case 2: The email address on the contact is taken by an existing user, whose type is "Contact".
        // Case 3: The email address on the contact is taken by an existing user, whose type is "Business".
        toPut.setUserId(existingUser.getId());
      } else {
        // Case 4: The email address on the contact is taken by an existing user, whose type is something else.
        throw new RuntimeException("Tried to create a contact for an email address taken by a user that is neither a business user nor a contact user.");
      }
    }
    return super.put_(x, toPut);
  }
}
