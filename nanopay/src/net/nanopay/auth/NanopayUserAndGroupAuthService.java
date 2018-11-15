package net.nanopay.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.UserAndGroupAuthService;

public class NanopayUserAndGroupAuthService extends UserAndGroupAuthService {

    public NanopayUserAndGroupAuthService(X x) {
        super(x);
      }

    @Override
    public void start() {
      userDAO_     = (DAO) getX().get("bareUserDAO");
      groupDAO_    = (DAO) getX().get("groupDAO");
      sessionDAO_  = (DAO) getX().get("sessionDAO");
    }
  }