package net.nanopay.sme;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.*;
import foam.nanos.auth.token.Token;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.util.SafetyUtil;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.auth.email.EmailWhitelistEntry;
import net.nanopay.model.Business;
import net.nanopay.model.Invitation;
import net.nanopay.model.InvitationStatus;

import java.net.URLEncoder;
import java.util.*;

import static foam.mlang.MLang.*;

/**
 * Business invitation DAO is responsible for checking if the invitation is sent
 * to an external or internal user. Internal Users will receive a notification &
 * email allowing them to join the business. External Users will receive an
 * email which will redirect them to the sign up portal and take them through
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
    User user = (User) x.get("user");
    Business business = null;

    // Check is user is a business,
    // Requirement: there was a point where user was not a business and
    // was incorrectly stopping execution with a cast exception
    // User was system before binding to user(business)
    if ( (Business.class).isInstance(user) ) {
      business = (Business) user;
    } else {
      return super.put_(x, obj);
    }

    // AUTH CHECK
    AuthService auth = (AuthService) x.get("auth");
    String addBusinessPermission = "business.add." + business.getBusinessPermissionId() + ".*";
    if ( ! auth.check(x, addBusinessPermission) ) {
      throw new AuthorizationException("You don't have the ability to add users to this business.");
    }

    Invitation invite = (Invitation) obj.fclone();

    // A legal requirement is that we need to do a compliance check on any
    // user that can make payments, which includes admins and approvers.
    // However, we only do compliance checks on the company right now, not
    // every user that can act as it. Therefore in the short term we'll
    // only allow users to invite employees, because employees can't pay
    // invoices, only submit them for approval.

    // However, one of our use cases is when an employee of a company signs up,
    // partially fills out the business profile and then invites the company
    // signing officer to sign up and finish the business profile. For that
    // reason we include the compliance condition below. We need to allow people
    // to add an admin to their business before finishing the business profile
    // so that the company signing officer can sign up and finish the business
    // profile.
    if (
      business.getCompliance() != ComplianceStatus.NOTREQUESTED &&
      ! SafetyUtil.equals(invite.getGroup(), "employee")
    ) {
      throw new AuthorizationException("Only employees can be added for the time being."); // TODO: Come up with a better message.
    }

    DAO localUserUserDAO = (DAO) x.get("localUserUserDAO");

    Invitation existingInvite = (Invitation) getDelegate().inX(getX()).find(
      OR(
        EQ(Invitation.ID, invite.getId()),
        AND(
          EQ(Invitation.EMAIL, invite.getEmail()),
          EQ(Invitation.CREATED_BY, invite.getCreatedBy())
        )
      )
    );

    invite.setCreatedBy(business.getId());
    // We only care about newly created invitations here.
    if ( existingInvite != null ) {
      invite.setId(existingInvite.getId());
      return super.put_(x, invite);
    }

    User internalUser = (User) localUserUserDAO.find(EQ(User.EMAIL, invite.getEmail()));
    boolean internalUserBool;
    if ( internalUserBool = internalUser != null ) {
      invite.setInternal(true);
      invite.setStatus(InvitationStatus.SENT);
    } else {
      // Add invited user to the email whitelist.
      EmailWhitelistEntry entry = new EmailWhitelistEntry();
      entry.setId(invite.getEmail());
      whitelistedEmailDAO_.inX(getX()).put(entry);
    }
    // Send email invite
    sendInvitationEmail(x, business, invite, internalUserBool);
    invite.setTimestamp(new Date());
    return super.put_(x, invite);
  }

  /**
   * Send an email inviting the recipient to join a Business in Ablii.
   * @param x The context.
   * @param business The business they will join.
   * @param invite The invitation object.
   * @param internalUserBool True is user is already a user, False if user is not.
   */
  public void sendInvitationEmail(X x, Business business, Invitation invite, boolean internalUserBool) {
    DAO tokenDAO = ((DAO) x.get("tokenDAO")).inX(x);
    EmailService email = (EmailService) x.get("email");
    User agent = (User) x.get("agent");
    Logger logger = (Logger) getX().get("logger");

    // Associated the business into the param. Add group type (admin, approver, employee)
    Map tokenParams = new HashMap();
    tokenParams.put("businessId", business.getId());
    tokenParams.put("group", invite.getGroup());
    tokenParams.put("inviteeEmail", invite.getEmail());
    tokenParams.put("internal", invite.getInternal());

    Group group = business.findGroup(x);
    AppConfig appConfig = group.getAppConfig(x);
    String url = appConfig.getUrl().replaceAll("/$", "");

    // Create token for user registration
    Token token = new Token();
    token.setParameters(tokenParams);
    token.setData(UUID.randomUUID().toString());
    token = (Token) tokenDAO.put(token);

    // Create the email message
    EmailMessage message = new EmailMessage.Builder(x)
        .setTo(new String[]{invite.getEmail()})
        .build();
    HashMap<String, Object> args = new HashMap<>();
    args.put("inviterName", agent.getFirstName());
    args.put("business", business.getBusinessName());

    // Encoding business name and email to handle special characters.
    String encodedBusinessName, encodedEmail;
    try {
      encodedEmail =  URLEncoder.encode(invite.getEmail(), "UTF-8");
      encodedBusinessName = URLEncoder.encode(business.getBusinessName(), "UTF-8");
    } catch(Exception e) {
      logger.error("Error encoding the email or business name.", e);
      throw new RuntimeException(e);
    }

    url += "?token=" + token.getData() + "&email=" + encodedEmail + "&companyName=" + encodedBusinessName;
    url += ( internalUserBool ? "#invited" : "#sign-up" ) ;
    args.put("link", url);
    email.sendEmailFromTemplate(x, business, message, "external-business-add", args);
  }
}
