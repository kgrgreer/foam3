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
import foam.util.Auth;
import foam.util.SafetyUtil;
import net.nanopay.model.Business;

import static foam.mlang.MLang.EQ;

/**
 * When a new user is signing up and wants to create a business, this decorator
 * will create the business for them as the system user but make sure that the
 * business is associated with the user, not the business.
 */
public class NewUserCreateBusinessDAO extends ProxyDAO {
  public DAO businessDAO_;

  public NewUserCreateBusinessDAO(X x, DAO delegate) {
    super(x, delegate);
    businessDAO_ = (DAO) x.get("businessDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) obj;

    if ( user == null ) {
      throw new RuntimeException("Cannot put null.");
    }

    if ( SafetyUtil.isEmpty(user.getOrganization()) ) {
      throw new RuntimeException("Organization is required.");
    }

    // We want the system user to be putting the User we're trying to create. If
    // we didn't do this, the user in the context's id would be 0 and many
    // decorators down the line would fail because of authentication checks.
    //
    // Put the user so that it gets an id.
    user = (User) super.put_(getX(), obj).fclone();

    assert user.getId() != 0;

    X userContext = Auth.sudo(x, user);

    Business business = new Business.Builder(userContext)
      .setBusinessName(user.getOrganization())
      .build();

    businessDAO_.inX(userContext).put(business);

    return user;
  }
}
