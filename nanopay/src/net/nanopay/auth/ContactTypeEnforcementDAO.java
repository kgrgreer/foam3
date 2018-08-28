package net.nanopay.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;

public class ContactTypeEnforcementDAO extends ProxyDAO {
  public ContactTypeEnforcementDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User toPut = (User) obj;

    if ( toPut != null && ! SafetyUtil.equals(toPut.getType(), "Contact") ) {
      throw new RuntimeException("You must set type to 'Contact' for users in the contactDAO.");
    }

    return super.put_(x, toPut);
  }
}
