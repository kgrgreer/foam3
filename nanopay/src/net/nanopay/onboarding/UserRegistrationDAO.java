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
import net.nanopay.contacts.Contact;
import net.nanopay.model.Business;
import net.nanopay.model.Invitation;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

import static foam.mlang.MLang.*;

public class UserRegistrationDAO
  extends ProxyDAO
{
  protected String spid_;
  protected String group_;

  public DAO invitationDAO_;
  public DAO tokenDAO_;
  public DAO localBusinessDAO_;

  public UserRegistrationDAO(X x, String group, DAO delegate) {
    this(x, "nanopay", group, delegate);
  }

  public UserRegistrationDAO(X x, String spid, String group, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    spid_  = spid;
    group_ = group;
    tokenDAO_ = (DAO) x.get("tokenDAO");
    localBusinessDAO_ = (DAO) x.get("localBusinessDAO");
    invitationDAO_ = (DAO) x.get("businessInvitationDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) obj;
    Boolean isInternal = false;

    if ( user == null || SafetyUtil.isEmpty(user.getEmail()) ) {
      throw new RuntimeException("Email required");
    }
    
    // We want the system user to be putting the User we're trying to create. If
    // we didn't do this, the user in the context's id would be 0 and many
    // decorators down the line would fail because of authentication checks.

    // If we want use the system user, then we need to copy the http request/appconfig to system context
    X sysContext = getX()
      .put(HttpServletRequest.class, x.get(HttpServletRequest.class))
      .put("appConfig", x.get("appConfig"));

    // Make sure the email the user is signing up with matches the email the invite was sent to
    if ( ! SafetyUtil.isEmpty(user.getSignUpToken()) ) {
      Token token = (Token) tokenDAO_.find(EQ(Token.DATA, user.getSignUpToken()));
      user.setEmailVerified(token != null);

      if ( token == null ) {
        throw new RuntimeException("Uknown token.");
      }

      Map<String, Object> params = (Map) token.getParameters();

      // Check if user is internal ( already a registered user ), which will happen if adding a user to
      // a business.
      isInternal = params.containsKey("internal" ) && ((Boolean) params.get("internal"));
      if ( ! isInternal ) {
        checkUserDuplication(x, user);
      }
      if ( params.containsKey("businessId") ) {
        long businessId = (long) params.get("businessId");

        if ( businessId != 0 ) {
          Business business = (Business) localBusinessDAO_.inX(sysContext).find(businessId);
          if ( business == null ) {
            throw new RuntimeException("Business doesn't exist.");
          }

          // Get a context with the Business in it
          X businessContext = Auth.sudo(sysContext, business);

          Invitation invitation = (Invitation) invitationDAO_
            .inX(businessContext)
            .find(
              AND(
                EQ(Invitation.CREATED_BY, businessId),
                EQ(Invitation.EMAIL, user.getEmail())
              )
            );

          if ( params.containsKey("inviteeEmail") ) {
            if ( invitation == null || (! params.get("inviteeEmail").equals(invitation.getEmail())) ) {
              throw new RuntimeException(("Email does not match invited email."));
            }
          } else {
            throw new RuntimeException("Invitation is out of date. Please request a new one.");
          }
        }
      }
    }
    if ( ! isInternal ) checkUserDuplication(x, user);
    return super.put_(sysContext, user);
  }

  public void checkUserDuplication(X x, User user) {
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
