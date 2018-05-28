package net.nanopay.admin;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.util.SafetyUtil;
import foam.core.PropertyInfo;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;

/**
 * This DAO decorator updates the previousStatus property on the user model
 * to be equal to the user's old status whenever the status property is updated
 */
public class AccountStatusUserDAO
  extends ProxyDAO
{
  protected Logger logger_;

  public AccountStatusUserDAO(X x, DAO delegate) {
    super(x, delegate);
    logger_ = (Logger) x.get("logger");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    try {
      User newUser = (User) obj;
      User oldUser = (User) getDelegate().find(newUser.getId());
      PropertyInfo prop = (PropertyInfo) User.getOwnClassInfo().getAxiomByName("status");

      // if new status and old status are different then set previous status
      if (SafetyUtil.compare(prop.get(newUser), prop.get(oldUser)) != 0) {
        newUser.setPreviousStatus(oldUser.getStatus());
      }
    } catch (Throwable t) {
      logger_.error("Error updating previous status", t);
    }

    return super.put_(x, obj);
  }
}