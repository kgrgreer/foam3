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
    User    user     = (User) x.get("user");
    Contact toPut = (Contact) obj;
    DAO localUserDAO = (DAO) x.get("localUserDAO");

    if ( toPut == null ) {
      throw new RuntimeException("Cannot put null.");
    } else if ( SafetyUtil.isEmpty(toPut.getEmail()) ) {
      throw new RuntimeException("Please provide an email address.");
    }
    
    // Sets owner if none is present.
    long ownerId = toPut.getOwner();
    if ( ownerId == 0 ) {
      toPut.setOwner(user.getId());
    }

    Sink sink = new ArraySink();
    sink = localUserDAO
      .where(EQ(User.EMAIL, toPut.getEmail().toLowerCase()))
      .limit(1)
      .select(sink);
    List data = ((ArraySink) sink).getArray();

    if ( data.size() != 1 ) {
      User newUser = new User();
      newUser.setEmail(toPut.getEmail());
      newUser.setType("Contact");
      try {
        newUser = (User) localUserDAO.put_(x, newUser);
        toPut.setUserId(newUser.getId());
      } catch (Throwable t) {
        throw new RuntimeException("Couldn't create a new user for email address: '" + toPut.getEmail() + "'. Got the following error: " + t.getMessage(), t);
      }
    } else {
      User existingUser = (User) data.get(0);
      toPut.setUserId(existingUser.getId());
    }
    return super.put_(x, toPut);
  }
}
