package net.nanopay.partners;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import static foam.mlang.MLang.*;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.concurrent.TimeUnit;
import java.util.Date;
import java.util.HashMap;

import net.nanopay.model.Invitation;
import net.nanopay.partners.InvitationStatus;
import net.nanopay.partners.ui.PartnerInvitationNotification;

public class SendInvitationDAO
  extends ProxyDAO
{
  public SendInvitationDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  /**
   * Get an existing invitation from one user to another
   * @param {String} email The email address of the recipient
   * @param {Long} userId The userId of the user who sent the invite
   * @returns {Invitation} Or null if no invite found.
   */
  private Invitation getExistingInvite(String email, Long userId) {
    ArraySink existingInvites = (ArraySink) this
        .where(AND(
          EQ(Invitation.EMAIL, email),
          EQ(Invitation.CREATED_BY, userId)))
        .limit(1)
        .select(new ArraySink());
    boolean inviteExists = existingInvites.getArray().size() == 1;
    return inviteExists ? (Invitation) existingInvites.getArray().get(0) : null;
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
      User currentUser,
      boolean userExists
  ) {
    AppConfig config = (AppConfig) x.get("appConfig");
    EmailService email = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    message.setTo(new String[]{invite.getEmail()});
    HashMap<String, Object> args = new HashMap<>();
    String url = config.getUrl();
    String urlPath = userExists ? "#notifications" : "#sign-up";

    args.put("message", invite.getMessage());

    args.put("inviterName", currentUser.getLegalName());
    args.put("link", url + urlPath);

    String template = userExists
        ? "partners-internal-invite"
        : "partners-external-invite";

    try {
      email.sendEmailFromTemplate(currentUser, message, template, args);
    } catch(Throwable t) {
      Logger logger = ((Logger) x.get(Logger.class));
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
    notification.setBody(currentUser.getLegalName() +
        " invited you to connect.");
    notification.setNotificationType("Partner invitation");
    notificationDAO.put(notification);
  }

  /**
   * Get a user by their email address
   * @param {DAO} userDAO The user DAO to search
   * @param {String} emailAddress The email address
   * @returns {User} The matching user or null
   */
  private User getUserByEmail(DAO userDAO, String emailAddress) {
    ArraySink usersWithMatchingEmail = (ArraySink) userDAO
        .where(EQ(User.EMAIL, emailAddress))
        .limit(1)
        .select(new ArraySink());
    return usersWithMatchingEmail.getArray().size() == 1
        ? (User) usersWithMatchingEmail.getArray().get(0)
        : null;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    DAO userDAO = (DAO) x.get("localUserDAO");
    DAO notificationDAO = (DAO) x.get("notificationDAO");
    Invitation invite = (Invitation) obj;
    User currentUser = (User) x.get("user");

    Invitation existingInvite =
        getExistingInvite(invite.getEmail(), currentUser.getId());

    User recipient = getUserByEmail(userDAO, invite.getEmail());
    if ( recipient.getId() == currentUser.getId() ) return null;

    if ( existingInvite != null ) {
      
      // This is here because if it wasn't, MakeConnectionDAO wouldn't be able
      // to set the status because this DAO decorator would overwrite it. We
      // can't just pass on invite instead of existingInvite at the bottom of
      // this block either because that's a security risk. Users could set
      // fields like createdBy or inviteeId to be things they shouldn't. This
      // probably isn't the best solution.
      existingInvite.setStatus(invite.getStatus());

      long hoursSinceLastSend = getHoursSinceLastSend(existingInvite);
      boolean noResponse = existingInvite.getStatus() == InvitationStatus.SENT;
      if ( hoursSinceLastSend >= 2 && noResponse ) {
        sendInvitationEmail(x, existingInvite, currentUser, recipient != null);
        existingInvite.setTimestamp(new Date());
      }
      return super.put_(x, existingInvite);
    }

    Invitation newInvite = new Invitation();
    newInvite.setEmail(invite.getEmail());
    newInvite.setStatus(InvitationStatus.SENT);
    newInvite.setCreatedBy(currentUser.getId());
    newInvite.setTimestamp(new Date());

    if ( recipient != null  ) {
      newInvite.setInviteeId(recipient.getId());
      newInvite.setInternal(true);
    } else {
      // TEMPORARY: We don't support external users yet
      return newInvite;
    }

    sendInvitationEmail(x, newInvite, currentUser, recipient != null);
    sendInvitationNotification(notificationDAO, currentUser, recipient);

    return super.put_(x, newInvite);
  }
}
