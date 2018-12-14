package net.nanopay.meter;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.MLang;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.nanos.session.Session;

public class LogoutDisabledUserDAO extends ProxyDAO {
  public LogoutDisabledUserDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User newUser = (User) obj;
    User oldUser = (User) getDelegate().find(newUser.getId());

    if (oldUser != null
      && oldUser.getEnabled()
      && !newUser.getEnabled()
    ) {
      DAO sessionDAO = (DAO) x.get("sessionDAO");
      Session session = (Session) sessionDAO.find(
        MLang.EQ(Session.USER_ID, newUser.getId()));

      if (session != null) {
        AuthService auth = (AuthService) x.get("auth");
        auth.logout(session.getContext());
      }
    }

    return super.put_(x, obj);
  }
}
