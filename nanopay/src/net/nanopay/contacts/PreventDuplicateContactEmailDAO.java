package net.nanopay.contacts;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.accounting.quick.model.QuickContact;

import java.util.List;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/**
 * The purpose of this DAO decorator is to prevent users from creating two
 * contacts with the same email address.
 */
public class PreventDuplicateContactEmailDAO extends ProxyDAO {
  public PreventDuplicateContactEmailDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! ( obj instanceof Contact ) ) {
      return super.put_(x, obj);
    }

    User user = (User) x.get("user");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    Contact toPut = (Contact) obj;

    if ( toPut == null ) {
      throw new RuntimeException("Cannot put null.");
    }

    if ( toPut.getBusinessId() != 0 && SafetyUtil.equals(toPut.getEmail(), "") ) {
      return super.put_(x, toPut);
    }

    Sink sink = new ArraySink();
    sink = getDelegate().inX(x)
      .where(AND(EQ(Contact.EMAIL, toPut.getEmail().toLowerCase()), EQ(Contact.OWNER, user.getId())))
      .limit(1)
      .select(sink);
    List data = ((ArraySink) sink).getArray();

    if ( data.size() == 1 ) {
      Contact existingContact = (Contact) data.get(0);
      if ( existingContact.getId() != toPut.getId() && ! ( existingContact instanceof QuickContact ) ) {
        throw new RuntimeException("You already have a contact with that email address.");
      }
    }

    return super.put_(x, toPut);
  }
}
