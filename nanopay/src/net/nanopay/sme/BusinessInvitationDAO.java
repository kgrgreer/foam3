package net.nanopay.sme;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.auth.email.EmailWhitelistEntry;
import net.nanopay.model.Invitation;
import net.nanopay.model.InvitationStatus;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.auth.AuthorizationException;
import net.nanopay.contacts.ContactStatus;
import net.nanopay.contacts.Contact;
import net.nanopay.model.Business;
import foam.nanos.auth.Group;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.token.Token;
import foam.nanos.notification.email.EmailService;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.UUID;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.NOT;
import static foam.mlang.MLang.INSTANCE_OF;

/**
  * Business invitation DAO is responsible for checking if the invitation is sent to an external
  * or internal user. Internal Users will receive a notification & email allowing them to join the business
  * External Users will receive an email which will redirect them to the sign up portal and take them through
  * the necessary steps to join a business.
*/
public class BusinessInvitationDAO
  extends ProxyDAO
{
  public DAO whitelistedEmailDAO_;

  public BusinessInvitationDAO(X x, DAO delegate) {
    super(x, delegate);
    whitelistedEmailDAO_ = (DAO) x.get("whitelistedEmailDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Business business = (Business) x.get("user");
    DAO localUserDAO = (DAO) x.get("localUserDAO");

    Invitation invite = (Invitation) obj.fclone();

    User internalUser = (User) localUserDAO.find(AND(
        EQ(User.EMAIL, invite.getEmail())
      ));

    if ( internalUser != null ) {
      addUserToBusiness(x, business, internalUser, invite);
      invite.setInternal(true);
    } else {
      // Add invited user to the email whitelist.
      EmailWhitelistEntry entry = new EmailWhitelistEntry();
      entry.setId(invite.getEmail());
      whitelistedEmailDAO_.inX(getX()).put(entry);

      // Send notification to email.
      sendExternalInvitationNotification(x, business, invite);
    }

    invite.setTimestamp(new Date());
    return super.put_(x, invite);
  }

  // Checks to see if user is capable of adding a user to the business.
  public void addUserToBusiness(X x, Business business, User internalUser, Invitation invite) {
    DAO agentJunctionDAO = ((DAO) x.get("agentJunctionDAO")).inX(x);
    AuthService auth = (AuthService) x.get("auth");
    String addBusinessPermission = (String) "business.add." + business.getBusinessPermissionId() + ".*";

    if ( ! auth.check(x, addBusinessPermission) ) {
      throw new AuthorizationException("You don't have the ability to add users to this business.");
    }

    // If junction already exists, throw exception.
    UserUserJunction junction = (UserUserJunction) agentJunctionDAO.find(AND(
      EQ(UserUserJunction.SOURCE_ID, internalUser.getId()),
      EQ(UserUserJunction.TARGET_ID, business.getId())
    ));

    if ( junction != null ) {
      throw new AuthorizationException("User already exists within the business.");
    }

    // Create the junction object if user exists.
    junction = new UserUserJunction();
    junction.setSourceId(internalUser.getId());
    junction.setTargetId(business.getId());
    junction.setGroup(business.getBusinessPermissionId() + '.' + invite.getGroup());
    agentJunctionDAO.put(junction);
    // TODO: send email notification to user indicating business has added them.
  }

  // Set up the parameters of the token to include user setup information
  public void sendExternalInvitationNotification(X x, Business business, Invitation invite) {
    DAO tokenDAO = ((DAO) x.get("tokenDAO")).inX(x);
    EmailService email = (EmailService) x.get("email");
    User agent = (User) x.get("agent");

    // Associated the business into the param. Add group type (admin, approver, employee)
    Map tokenParams = new HashMap();
    tokenParams.put("businessId", business.getId());
    tokenParams.put("group", invite.getGroup());

    Group group = business.findGroup(x);
    AppConfig appConfig = group.getAppConfig(x);
    String url = appConfig.getUrl().replaceAll("/$", "");

    // Create token for user registration
    Token token = (Token) new Token();
    token.setParameters(tokenParams);
    token.setData(UUID.randomUUID().toString());
    token = (Token) tokenDAO.put(token);

    // Create the email message
    EmailMessage message = new EmailMessage.Builder(x)
        .setTo(new String[]{invite.getEmail()})
        .build();
    HashMap<String, Object> args = new HashMap<>();
    args.put("firstName", agent.getFirstName());
    args.put("business", business.getBusinessName());
    args.put("group", invite.getGroup());
    // TODO: We should be encoding the URI.
    args.put("link", url +"?token=" + token.getData() + "&email=" + invite.getEmail() + "#sign-up");

    email.sendEmailFromTemplate(x, business, message, "external-business-add", args);
  }
}
