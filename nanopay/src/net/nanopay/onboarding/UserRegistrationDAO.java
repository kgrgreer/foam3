package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;

import static foam.mlang.MLang.EQ;

public class UserRegistrationDAO
  extends ProxyDAO
{
  protected String spid_;
  protected String group_;

  public UserRegistrationDAO(X x, String group, DAO delegate) {
    this(x, "nanopay", group, delegate);
  }

  public UserRegistrationDAO(X x, String spid, String group, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    spid_  = spid;
    group_ = group;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) obj;

    if ( user == null || SafetyUtil.isEmpty(user.getEmail()) ) {
      throw new RuntimeException("Email required");
    }

    if ( getDelegate().inX(x).find(EQ(User.EMAIL, user.getEmail())) != null ) {
      throw new RuntimeException("User with same email address already exists: " + user.getEmail());
    }

    user.setSpid(spid_);
    user.setGroup(group_);

    // We want the system user to be putting the User we're trying to create. If
    // we didn't do this, the user in the context's id would be 0 and many
    // decorators down the line would fail because of authentication checks.
    return super.put_(getX(), user);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return new ArraySink();
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    return null;
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {

  }
}
