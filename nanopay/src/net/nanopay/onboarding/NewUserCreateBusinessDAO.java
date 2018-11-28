package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.auth.token.Token;
import foam.util.Auth;
import foam.util.SafetyUtil;
import net.nanopay.model.Business;

import javax.servlet.http.HttpServletRequest;

import java.util.Map;

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

    // Check if the user is signing up from an email link. If so, mark their email as verified.
    if ( ! SafetyUtil.isEmpty(user.getSignUpToken()) ) {
      Token token = (Token) tokenDAO_.find(EQ(Token.DATA, user.getSignUpToken()));
      user.setEmailVerified(token != null);

      if ( token == null ) {
        throw new RuntimeException("Unable to process user registration");
      }

      Map<String, Object> params = (Map) token.getParameters();

      // There can be different tokens with different parameters used in the
      // sign up form. When adding a user to a business, we'll have the group
      // and businessId parameters set, so check for those here.
      if ( params.containsKey("group") && params.containsKey("businessId") ) {
        String group = (String) params.get("group");
        long businessId = (long) params.get("businessId");

        if ( businessId != 0 ) {
          Business business = (Business) businessDAO_.inX(sysContext).find(businessId);
          if ( business == null ) {
            throw new RuntimeException("Business doesn't exist");
          }

          user = (User) super.put_(sysContext, user);

          // Set user into the business part of the token
          UserUserJunction junction = new UserUserJunction();
          junction.setSourceId(user.getId());
          junction.setTargetId(business.getId());
          String junctionGroup = business.getBusinessPermissionId() + "." + group;
          junction.setGroup(junctionGroup);

          agentJunctionDAO_.inX(sysContext).put(junction);

          // Process token
          Token clone = (Token) token.fclone();
          clone.setProcessed(true);
          tokenDAO_.inX(sysContext).put(clone);

          // Return here because we don't want to create a duplicate business
          // with the same name. Instead, we just want to create the user and
          // add them to an existing business.
          return user;
        }
      }

      // Process token
      Token clone = (Token) token.fclone();
      clone.setProcessed(true);
      tokenDAO_.inX(sysContext).put(clone);
    }

    // Put the user so that it gets an id.
    user = (User) super.put_(sysContext, obj).fclone();

    assert user.getId() != 0;

    X userContext = Auth.sudo(x, user);

    Business business = new Business.Builder(userContext)
      .setBusinessName(user.getOrganization())
      .setOrganization(user.getOrganization())

      // We need to be able to send emails to businesses, but until now we were
      // avoiding giving businesses an email address. However, in Ablii users
      // are always acting as a business, meaning the payer and payee of every
      // invoice are always businesses, and therefore we need an email address
      // somehow associated with a business so that we can send payment-related
      // emails to it.
      // We have a few options:
      //   1. Set the email address of the business to the email address of the
      //      user that creates it. Allow it to be updated later.
      //   2. Send emails to everyone in the business when that business needs
      //      to receive an email.
      // I'm going with option 1 right now, but I don't know if it's a perfect
      // solution or if there might be unforeseen consequences for letting
      // businesses have email addresses.
      .setEmail(user.getEmail())
      .setEmailVerified(true)
      .build();

    businessDAO_.inX(userContext).put(business);

    return user;
  }
}
