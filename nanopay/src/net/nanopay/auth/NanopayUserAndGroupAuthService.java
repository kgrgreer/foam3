package net.nanopay.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.UserAndGroupAuthService;

/**
 * We need a nanopay-specific extension of the FOAM UserAndGroupAuthService so
 * that we can use bareUserDAO, which contains extensions of the User model such
 * as Business. If we don't make this change, then when a User acts as a Business,
 * auth.check will return false because it can't find the business when it does 
 * the lookup in userDAO_. This happens because FOAM doesn't have the bareUserDAO,
 * so it won't find the Business and will therefore return false. 
 * Therefore we need to replace localUserDAO with bareUserDAO so when it does 
 * the lookup it will be able to find the Business.
 */
public class NanopayUserAndGroupAuthService extends UserAndGroupAuthService {

    public NanopayUserAndGroupAuthService(X x) {
        super(x);
      }

    @Override
    public void start() {
      super.start();
      userDAO_     = (DAO) getX().get("bareUserDAO");
    }
  }