package net.nanopay.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.*;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import net.nanopay.auth.PublicUserInfo;
import java.util.List;

/*
  Decorator on localUserDAO that updates or creates new public users & places them
  within the publicUserDAO. Public users information reflect user info.
*/

public class MirrorToPublicUserUserDAO
  extends ProxyDAO
{
  protected DAO publicUserDAO_;

  public MirrorToPublicUserUserDAO(
      X x,
      DAO delegate
  ) {
    super(x, delegate);
    publicUserDAO_ = (DAO) x.get("localPublicUserDAO"); 
    ArraySink sink = (ArraySink) getDelegate().select(new ArraySink());
    List users = sink.getArray();

    for ( int i = 0 ; i < users.size() ; i++ ) {
      User user = (User) users.get(i);
      PublicUserInfo publicUser = new PublicUserInfo(user);
      publicUserDAO_.put(publicUser);
    }
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User result = (User) super.put_(x, obj);

    // TODO: Implement privacy setting logic to avoid creating public users for private accounts.
    PublicUserInfo entity = new PublicUserInfo(result);
    publicUserDAO_.put(entity);
    return result;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    PublicUserInfo publicUser = (PublicUserInfo) publicUserDAO_.find(obj);

    publicUserDAO_.remove(publicUser);
    return super.remove_(x, obj);
  }
}
