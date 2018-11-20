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
import foam.nanos.auth.token.Token;
import foam.util.Auth;
import foam.util.SafetyUtil;
import net.nanopay.model.Business;

import javax.servlet.http.HttpServletRequest;

import static foam.mlang.MLang.EQ;

/**
 * When a new user is signing up and wants to create a business, this decorator
 * will create the business for them. Since the user is signing up, they don't
 * have a User in the system yet which could create the business. Therefore,
 * this decorator creates the business as the system, but makes sure that the
 * business is owned by the user, not the system.
 */
public class NewUserCreateBusinessDAO extends ProxyDAO {
  public DAO businessDAO_;
  public DAO tokenDAO_;

  public NewUserCreateBusinessDAO(X x, DAO delegate) {
    super(x, delegate);
    businessDAO_ = (DAO) x.get("businessDAO");
    tokenDAO_ = (DAO) x.get("tokenDAO");
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

    // Check if the user is signing up from an email link. If so, mark their email as verified.
    Token token = (Token) tokenDAO_.find(EQ(Token.DATA, user.getSignUpToken()));
    user.setEmailVerified(token != null);

    // We want the system user to be putting the User we're trying to create. If
    // we didn't do this, the user in the context's id would be 0 and many
    // decorators down the line would fail because of authentication checks.

    // If we want use the system user, then we need to copy the http request/appconfig to system context
    X sysContext = getX()
      .put(HttpServletRequest.class, x.get(HttpServletRequest.class))
      .put("appConfig", x.get("appConfig"));

    // Put the user so that it gets an id.
    user = (User) super.put_(sysContext, obj).fclone();

    assert user.getId() != 0;

    X userContext = Auth.sudo(x, user);

    Business business = new Business.Builder(userContext)
      .setBusinessName(user.getOrganization())
      .setEmailVerified(true)
      .build();

    businessDAO_.inX(userContext).put(business);

    return user;
  }
}
