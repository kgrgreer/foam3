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
import net.nanopay.sme.ui.BusinessInvitationNotification;
import net.nanopay.contacts.ContactStatus;
import net.nanopay.contacts.Contact;
import net.nanopay.model.Business;

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
    User user = (User) x.get("user");
    DAO bareUserDAO = (DAO) x.get("bareUserDAO");

    Invitation invite = (Invitation) obj.fclone();

    long hoursSinceLastSend = getHoursSinceLastSend(invite);
    boolean noResponse = invite.getStatus() == InvitationStatus.SENT;
    boolean isInviter = invite.getCreatedBy() == user.getId();

    if ( hoursSinceLastSend >= 2 && noResponse && isInviter ) {

      User internalUser = (User) bareUserDAO.find(AND(
          EQ(User.EMAIL, user.getEmail()),
          NOT(INSTANCE_OF(Contact.class)),
          NOT(INSTANCE_OF(Business.class))
        ));

      if ( internalUser != null ) {
        // Send notification and email to internal user.
        sendInvitationNotification(user, internalUser);

      } else {
        // Send notification to email.
        sendExternalInvitationNotification(user, invite);
      }

      invite.setTimestamp(new Date());
    }
    return super.put_(x, invite);
  }

  // Get the number of hours since the given invitation was last sent
  private long getHoursSinceLastSend(Invitation invite) {
    TimeUnit hoursUnit = TimeUnit.HOURS;
    Date now = new Date();
    long diff = now.getTime() - invite.getTimestamp().getTime();
    // NOTE: convert() will truncate down to the nearest full hour
    return hoursUnit.convert(diff, TimeUnit.MILLISECONDS);
  }

  // Send an email invitation
  private void sendInvitationEmail(
      X x,
      Invitation invite,
      User currentUser
  ) {
    AppConfig config = (AppConfig) x.get("appConfig");
    EmailService email = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    message.setTo(new String[]{invite.getEmail()});
    HashMap<String, Object> args = new HashMap<>();

    // Choose the appropriate email template.
    String template = invite.getIsContact() ?
      "contact-invite" :
      invite.getInternal() ?
        "partners-internal-invite" :
        "partners-external-invite";

    // Populate the email template.
    String url = config.getUrl();
    String urlPath = invite.getIsContact() ? "#sign-up" : invite.getInternal() ? "#notifications" : "#sign-up";
    args.put("message", invite.getMessage());
    args.put("inviterName", currentUser.getLegalName());
    args.put("link", url + urlPath);

    try {
      email.sendEmailFromTemplate(x, currentUser, message, template, args);
    } catch(Throwable t) {
      Logger logger = x.get(Logger.class);
      logger.error("Error sending invitation email.", t);
    }
  }

  private void sendExternalInvitationNotification(User currentUser, Invitation invite) {

  }

  // Send a notification inviting the user to connect
  private void sendInvitationNotification(
      User currentUser,
      User recipient
  ) {
    DAO notificationDAO = (DAO) x.get("notificationDAO");

    PartnerInvitationNotification notification =
        new PartnerInvitationNotification();
    notification.setUserId(recipient.getId());
    notification.setCreatedBy(currentUser.getId());
    notification.setInviterName(currentUser.getLegalName());
    notification.setNotificationType("Partner invitation");
    notificationDAO.put(notification);
  }
}
