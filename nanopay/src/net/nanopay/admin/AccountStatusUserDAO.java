package net.nanopay.admin;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;

/**
 * This DAO decorator updates the previousStatus property on the user model
 * to be equal to the user's old status whenever the status property is updated
 */
public class AccountStatusUserDAO
  extends ProxyDAO
{
  public AccountStatusUserDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User newUser = (User) obj;
    User oldUser = (User) getDelegate().find(newUser.getId());
    PropertyInfo prop = (PropertyInfo) User.getOwnClassInfo().getAxiomByName("status");

    // If new status and old status are different then set previous status
    if ( oldUser != null && ! SafetyUtil.equals(prop.get(newUser), prop.get(oldUser)) ) {
      newUser.setPreviousStatus(oldUser.getStatus());
    }

    return super.put_(x, obj);
  }
}