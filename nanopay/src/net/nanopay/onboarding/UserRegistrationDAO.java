package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.auth.token.Token;
import foam.nanos.logger.Logger;
import foam.util.Auth;
import foam.util.SafetyUtil;
import net.nanopay.contacts.Contact;
import net.nanopay.model.Business;
import net.nanopay.model.Invitation;
import net.nanopay.model.InvitationStatus;

import java.util.Date;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

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
    tokenDAO_ = (DAO) x.get("localTokenDAO");
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

    // Set user SPID and group defined by service.
    user.setSpid(spid_);
    user.setGroup(group_);

    // We want the system user to be putting the User we're trying to create. If
    // we didn't do this, the user in the context's id would be 0 and many
    // decorators down the line would fail because of authentication checks.

    // If we want use the system user, then we need to copy the http request/appconfig to system context
    X sysContext = getX()
      .put(HttpServletRequest.class, x.get(HttpServletRequest.class))
      .put("appConfig", x.get("appConfig"));

    // Check the parameters in the signup token
    if ( ! SafetyUtil.isEmpty(user.getSignUpToken()) ) {
      Token token = (Token) tokenDAO_.find(EQ(Token.DATA, user.getSignUpToken()));
      user.setEmailVerified(token != null);

      if ( token == null ) {
        throw new RuntimeException("Unknown token.");
      }

      Date currentDate = new Date();

      // Compare current date with the expiry date
      if ( token.getExpiry() != null && token.getExpiry().before(currentDate) ) {
        throw new RuntimeException("Invitation expired. Please request a new one.");
      }

      Map<String, Object> params = (Map) token.getParameters();

      // TODO: Why are we doing this here instead of letting PreventDuplicateEmailDAO catch this down the line?
      // Check if user is internal ( already a registered user ), which will happen if adding a user to
      // a business.
      isInternal = params.containsKey("internal") && ((Boolean) params.get("internal"));
      if ( ! isInternal ) {
        checkUserDuplication(x, user);
      }

      // Make sure the email which the user is signing up with matches the email the invite was sent to
      if ( params.containsKey("inviteeEmail") ) {
        if ( ! ((String) params.get("inviteeEmail")).equalsIgnoreCase(user.getEmail()) ) {
          Logger logger = (Logger) x.get("logger");
          String warningString = String.format(
            "A user was signing up via an email invitation. The email address we expected them to use was '%s' but the email address of the user in the context was actually '%s'. The user in the context's id was %d.",
            params.get("inviteeEmail"),
            user.getEmail(),
            user.getId()
          );
          logger.warning(warningString);
          throw new RuntimeException("Email does not match invited email.");
        }
      } else {
        throw new RuntimeException("Cannot process without an invited email.");
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
          if ( invitation.getStatus() != InvitationStatus.SENT ) {
            Logger logger = (Logger) x.get("logger");
            logger.warning("Business invitation is not in SENT status but is trying to get processed.");
          }
          invitation.setStatus(InvitationStatus.ACCEPTED);
          invitationDAO_.put(invitation);
        }
      }
    }

    // TODO: Why are we doing this here instead of letting PreventDuplicateEmailDAO catch this down the line?
    if ( ! isInternal ) checkUserDuplication(x, user);

    Address businessAddress = user.getBusinessAddress();

    // Prevent non cad accounts
    if ( ! businessAddress.getCountryId().equals("CA") && ! businessAddress.getCountryId().equals("US") ) {
      throw new IllegalStateException("Only Canadian and US businesses supported at this time.");
    }

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
