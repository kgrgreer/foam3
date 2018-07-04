package net.nanopay.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import net.nanopay.auth.PublicUserInfo;

/*
  Decorator on localUserDAO that updates or creates new public users & places them
  within the publicUserDAO. Public users information reflect user info.
*/

public class FillPublicUserDAO
  extends ProxyDAO
{
  protected DAO userDAO_;
  protected DAO publicUserDAO_;

  public FillPublicUserDAO(
      X x,
      DAO delegate
  ) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
    publicUserDAO_ = (DAO) x.get("publicUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User result = (User) super.put_(x, obj);

    // TODO: Implement privacy setting logic to avoid creating public users for private accounts.
    PublicUserInfo entity = new PublicUserInfo(result);
    publicUserDAO_.put(entity);
    return super.put_(x, obj);
  }
}
