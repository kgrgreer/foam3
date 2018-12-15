package net.nanopay.meter;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.MLang;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;
import net.nanopay.model.Business;

import java.util.List;

public class LogoutDisabledUserDAO extends ProxyDAO {
  protected DAO sessionDAO_;
  protected AuthService auth_;

  public LogoutDisabledUserDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User newUser = (User) obj;
    User oldUser = (User) getDelegate().find(newUser.getId());

    if (
      oldUser != null
      && oldUser.getEnabled()
      && !newUser.getEnabled()
    ) {
      sessionDAO_ = (DAO) x.get("sessionDAO");
      auth_ = (AuthService) x.get("auth");

      if (SafetyUtil.equals(newUser.getGroup(), "sme")) {
        logoutSmeUser(newUser, newUser.getEntities(x).getDAO());
      } else {
        logout(newUser, null);
      }
    }

    return super.put_(x, obj);
  }

  private void logoutSmeUser(User user, DAO entitiesDao) {
    ArraySink sink = (ArraySink) entitiesDao.select(new ArraySink());
    List<Business> businesses = sink.getArray();
    for (Business business : businesses) {
      logout(user, business);
    }
  }

  private void logout(User user, Business business) {
    long userId = user.getId();
    ArraySink sink = (ArraySink) sessionDAO_.where(
      MLang.EQ(Session.USER_ID,
        business != null ? business.getId() : userId))
      .select(new ArraySink());
    List<Session> sessions = sink.getArray();

    for (Session session : sessions) {
      User agent = (User) session.getContext().get("agent");
      if (
        session.getUserId() == userId
        || (agent !=null && agent.getId() == userId)
      ) {
        auth_.logout(session.getContext());
      }
    }
  }
}
