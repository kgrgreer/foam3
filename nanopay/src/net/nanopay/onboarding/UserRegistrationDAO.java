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
import net.nanopay.contacts.Contact;
import net.nanopay.model.Business;

import javax.servlet.http.HttpServletRequest;

import static foam.mlang.MLang.*;

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
    DAO userUserDAO = (DAO) x.get("userUserDAO");
    User user = (User) obj;

    if ( user == null || SafetyUtil.isEmpty(user.getEmail()) ) {
      throw new RuntimeException("Email required");
    }

    User userWithSameEmail = (User) getDelegate()
      .inX(x)
      .find(
        AND(
          EQ(User.EMAIL, user.getEmail()),
          NOT(INSTANCE_OF(Business.getOwnClassInfo())),
          NOT(INSTANCE_OF(Contact.getOwnClassInfo()))
        )
      );

    if ( userWithSameEmail != null ) {
      throw new RuntimeException("User with same email address already exists: " + user.getEmail());
    }

    user.setSpid(spid_);
    user.setGroup(group_);

    // We want the system user to be putting the User we're trying to create. If
    // we didn't do this, the user in the context's id would be 0 and many
    // decorators down the line would fail because of authentication checks.

    // If we want use the system user, then we need to copy the http request/appconfig to system context
    X sysContext = getX()
      .put(HttpServletRequest.class, x.get(HttpServletRequest.class))
      .put("appConfig", x.get("appConfig"));

    return super.put_(sysContext, user);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    // Return an empty sink instead of null to avoid breaking calling code that
    // expects this method to return a sink.
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
