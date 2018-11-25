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
import foam.nanos.auth.UserUserJunction;
import net.nanopay.auth.AgentJunctionStatus;

import java.util.Map;
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
  public DAO agentJunctionDAO_;
  public DAO tokenDAO_;

  public NewUserCreateBusinessDAO(X x, DAO delegate) {
    super(x, delegate);
    businessDAO_ = (DAO) x.get("businessDAO");
    agentJunctionDAO_ = (DAO) x.get("agentJunctionDAO");
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

    // We want the system user to be putting the User we're trying to create. If
    // we didn't do this, the user in the context's id would be 0 and many
    // decorators down the line would fail because of authentication checks.

    // If we want use the system user, then we need to copy the http request/appconfig to system context
    X sysContext = getX()
      .put(HttpServletRequest.class, x.get(HttpServletRequest.class))
      .put("appConfig", x.get("appConfig"));

    // Put the user so that it gets an id.
    user = (User) getDelegate().put_(sysContext, obj).fclone();

    assert user.getId() != 0;

    X userContext = Auth.sudo(x, user);

    // Add user to business and set junction between the two
    // Check to see if user has signUpToken associated to it
    if ( ! SafetyUtil.equals(user.getSignUpToken(), "") ) {
      Token token = (Token) tokenDAO_.find(EQ(Token.DATA, user.getSignUpToken()));
      user.setEmailVerified(token != null);
      user = (User) getDelegate().put_(sysContext, user).fclone();

      if ( token == null ){
        throw new RuntimeException("Unable to process user registration");
      }

      // Grab values from token parameters ( group, businessId )
      Map<String, Object> params = (Map) token.getParameters();
      String group = (String) params.get("group");
      long businessId = (long) params.get("businessId");

      // Process token
      Token clone = (Token) token.fclone();
      clone.setProcessed(true);
      tokenDAO_.put(clone);

      // Associate business to user being created if businessId exists in token params
      if ( businessId != 0) {
        Business business = (Business) businessDAO_.find(businessId);
        if ( business == null ) {
          throw new RuntimeException("Business doesn't exist");
        }

        // Set user into the business part of the token
        UserUserJunction junction = new UserUserJunction();
        junction.setSourceId(user.getId());
        junction.setTargetId(business.getId());
        String junctionGroup = (String) business.getBusinessPermissionId() + "." + group;
        junction.setGroup(junctionGroup);

        agentJunctionDAO_.put(junction);

        return user;
      }
    }

    Business business = new Business.Builder(userContext)
      .setBusinessName(user.getOrganization())
      .setOrganization(user.getOrganization())
      .setEmailVerified(true)
      .build();

    businessDAO_.inX(userContext).put(business);

    return user;
  }
}
