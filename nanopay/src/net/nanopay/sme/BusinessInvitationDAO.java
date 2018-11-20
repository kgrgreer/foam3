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
import net.nanopay.model.Invitation;
import net.nanopay.model.InvitationStatus;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.auth.AuthorizationException;
import net.nanopay.sme.ui.BusinessInvitationNotification;
import net.nanopay.contacts.ContactStatus;
import net.nanopay.contacts.Contact;
import net.nanopay.model.Business;
import foam.nanos.auth.AuthService;

import java.util.Date;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;

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
  public BusinessInvitationDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Business business = (Business) x.get("user");
    DAO bareUserDAO = (DAO) x.get("bareUserDAO");

    Invitation invite = (Invitation) obj.fclone();
    // long hoursSinceLastSend = getHoursSinceLastSend(invite);
    // boolean noResponse = invite.getStatus() == InvitationStatus.SENT;
    // boolean isInviter = invite.getCreatedBy() == user.getId();

    // if ( hoursSinceLastSend >= 2 && noResponse && isInviter ) {

      User internalUser = (User) bareUserDAO.find(AND(
          EQ(User.EMAIL, invite.getEmail()),
          NOT(INSTANCE_OF(Contact.class)),
          NOT(INSTANCE_OF(Business.class))
        ));

      if ( internalUser != null ) {
        addUserToBusiness(x, business, internalUser, invite);
      } else {
        // Send notification to email.
        sendExternalInvitationNotification(x, business, internalUser, invite);
      }

      invite.setTimestamp(new Date());
    // }
    return super.put_(x, invite);
  }

  // Checks to see if user is capable of adding a user to the business.
  private void addUserToBusiness(X x, Business business, User internalUser, Invitation invite) {
    DAO agentJunctionDAO = ((DAO) x.get("agentJunctionDAO")).inX(x);
    AuthService auth = (AuthService) x.get("auth");
    String addBusinessPermission = (String) "business.add." + business.getBusinessPermissionId() + ".*";

    if ( ! auth.check(x, addBusinessPermission) ) {
      throw new AuthorizationException("You don't have the ability to add users to this business.");
    }

    UserUserJunction junction = (UserUserJunction) agentJunctionDAO.find(AND(
      EQ(UserUserJunction.SOURCE_ID, internalUser.getId()),
      EQ(UserUserJunction.TARGET_ID, business.getId())
    ));

    if ( junction != null ) {
      throw new AuthorizationException("User already exists within the business.");
    }

    junction = new UserUserJunction();
    junction.setSourceId(internalUser.getId());
    junction.setTargetId(business.getId());
    junction.setGroup(business.getBusinessPermissionId() + '.' + invite.getGroup());
    agentJunctionDAO.put(junction);
    // Send notification and email to internal user.
    sendInvitationNotification(x, business, internalUser);
  }

  private void sendExternalInvitationNotification(X x, Business business, User internalUser, Invitation invite) {

  }


  // Get the number of hours since the given invitation was last sent
  private long getHoursSinceLastSend(Invitation invite) {
    TimeUnit hoursUnit = TimeUnit.HOURS;
    Date now = new Date();
    long diff = now.getTime() - invite.getTimestamp().getTime();
    // NOTE: convert() will truncate down to the nearest full hour
    return hoursUnit.convert(diff, TimeUnit.MILLISECONDS);
  }

  // Send a notification inviting the user to connect
  private void sendInvitationNotification(
      X x,
      User currentUser,
      User recipient
  ) {
    DAO notificationDAO = ((DAO) x.get("notificationDAO")).inX(x);

    BusinessInvitationNotification notification =
        new BusinessInvitationNotification();
    notification.setBusinessId(currentUser.getId());
    notification.setUserId(recipient.getId());
    notification.setNotificationType("Business Invitation");
    notificationDAO.put(notification);
  }
}
