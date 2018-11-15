package net.nanopay.partners;

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
import net.nanopay.partners.ui.PartnerInvitationNotification;

import java.util.Date;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;

public class SendInvitationDAO
  extends ProxyDAO
{
  public SendInvitationDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    Invitation invite = (Invitation) obj.fclone();

    long hoursSinceLastSend = getHoursSinceLastSend(invite);
    boolean noResponse = invite.getStatus() == InvitationStatus.SENT;
    boolean isInviter = invite.getCreatedBy() == user.getId();

    if ( hoursSinceLastSend >= 2 && noResponse && isInviter ) {

      sendInvitationEmail(x, invite, user);

      if ( invite.getInternal() ) {
        DAO notificationDAO = (DAO) x.get("notificationDAO");
        DAO userDAO = (DAO) x.get("localUserDAO");
        User recipient = (User) userDAO.find_(x, invite.getInviteeId());

        sendInvitationNotification(notificationDAO, user, recipient);
      }

      invite.setTimestamp(new Date());
    }

    return super.put_(x, invite);
  }

  /**
   * Get the number of hours since the given invitation was last sent
   * @param {Invitation} invite The invitation to check
   * @returns {long} The number of hours since last sent
   */
  private long getHoursSinceLastSend(Invitation invite) {
    TimeUnit hoursUnit = TimeUnit.HOURS;
    Date now = new Date();
    long diff = now.getTime() - invite.getTimestamp().getTime();
    // NOTE: convert() will truncate down to the nearest full hour
    return hoursUnit.convert(diff, TimeUnit.MILLISECONDS);
  }

  /**
   * Send an email invitation
   * @param {X} x The context
   * @param {Invitation} invite The invitation to send
   * @param {User} currentUser The current user
   */
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
    String url = config.getUrl();
    String urlPath = invite.getInternal() ? "#notifications" : "#sign-up";

    args.put("message", invite.getMessage());

    args.put("inviterName", currentUser.getLegalName());
    args.put("link", url + urlPath);

    String template = invite.getInternal()
        ? "partners-internal-invite"
        : "partners-external-invite";

    try {
      email.sendEmailFromTemplate(x, currentUser, message, template, args);
    } catch(Throwable t) {
      Logger logger = x.get(Logger.class);
      logger.error("Error sending invitation email.", t);
    }
  }

  /**
   * Send a notification inviting the user to connect
   * @param {DAO} notificationDAO The notification DAO to write to
   * @param {User} currentUser The current user
   * @param {User} recipient The user being invited
   */
  private void sendInvitationNotification(
      DAO notificationDAO,
      User currentUser,
      User recipient
  ) {
    PartnerInvitationNotification notification =
        new PartnerInvitationNotification();
    notification.setUserId(recipient.getId());
    notification.setCreatedBy(currentUser.getId());
    notification.setInviterName(currentUser.getLegalName());
    notification.setNotificationType("Partner invitation");
    notificationDAO.put(notification);
  }
}
