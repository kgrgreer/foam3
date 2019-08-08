package net.nanopay.partners;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.token.Token;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.util.Emails.EmailsUtility;
import net.nanopay.contacts.Contact;
import net.nanopay.contacts.ContactStatus;
import net.nanopay.model.Invitation;
import net.nanopay.model.InvitationStatus;
import net.nanopay.partners.ui.PartnerInvitationNotification;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;
import java.util.concurrent.TimeUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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

    // if this is a new invitation, get the id first
    if ( invite.getId() == 0 ) {
      invite = (Invitation) super.put_(x, invite).fclone();
    }

    if ( hoursSinceLastSend >= 2 && noResponse && isInviter ) {

      sendInvitationEmail(x, invite, user);

      if ( invite.getIsContact() ) {
        // Update the contact's status to invited.
        DAO contactDAO = (DAO) x.get("localContactDAO");
        Contact recipient = (Contact) contactDAO.find(invite.getInviteeId()).fclone();
        recipient.setSignUpStatus(ContactStatus.INVITED);
        contactDAO.put(recipient);
      }

      if ( invite.getInternal() ) {
        // Send the internal user a notification.
        DAO notificationDAO = (DAO) x.get("localNotificationDAO");
        DAO userDAO = (DAO) x.get("localUserDAO");
        User recipient = (User) userDAO.inX(x).find(invite.getInviteeId());
        sendInvitationNotification(notificationDAO.inX(x), user, recipient, invite);
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
    Logger logger = (Logger) getX().get("logger");
    EmailMessage message = new EmailMessage();
    message.setTo(new String[]{invite.getEmail()});
    HashMap<String, Object> args = new HashMap<>();

    // Choose the appropriate email template.
    String template = invite.getInternal() ?
        "partners-internal-invite" :
        "partners-external-invite";

    // Populate the email template.
    String url = config.getUrl();
    String urlPath = invite.getInternal() ? "#notifications" : "#sign-up";

    if ( invite.getIsContact() ) {
      DAO tokenDAO = (DAO) x.get("tokenDAO");
      // Create new token and associate passed in external user to token.
      Map tokenParams = new HashMap();
      tokenParams.put("inviteeEmail", invite.getEmail());

      Token token = new Token();
      token.setParameters(tokenParams);
      token.setExpiry(this.generateExpiryDate());
      token.setData(UUID.randomUUID().toString());
      token = (Token) tokenDAO.put(token);

      template = "contact-invite";
      try {
        urlPath = "?email="
          + URLEncoder.encode(invite.getEmail(), StandardCharsets.UTF_8.name())
          + "&token="
          + URLEncoder.encode(token.getData(), StandardCharsets.UTF_8.name())
          + "#sign-up";
      } catch (UnsupportedEncodingException e) {
        logger.error("Error generating contact token: ", e);
        throw new RuntimeException("Failed to encode URL parameters.", e);
      }
    }

    args.put("message", invite.getMessage());
    args.put("senderCompany", currentUser.getBusinessName());
    args.put("inviterName", currentUser.getBusinessName());
    args.put("link", url + urlPath);

    try {
      EmailsUtility.sendEmailFromTemplate(x, currentUser, message, template, args);
    } catch(Throwable t) {
      logger.error("Error sending invitation email.", t);
    }
  }

  /**
   * Get a 30 day expiry date
   */
  private Date generateExpiryDate(){
    Calendar calendar = Calendar.getInstance();
    calendar.add(Calendar.DAY_OF_MONTH, 30);
    return calendar.getTime();
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
      User recipient,
      Invitation invitation
  ) {
    PartnerInvitationNotification notification =
        new PartnerInvitationNotification();
    notification.setUserId(recipient.getId());
    notification.setCreatedBy(currentUser.getId());
    notification.setInviterName(currentUser.getLegalName());
    notification.setNotificationType("Partner invitation");
    notification.setInvitationId(invitation.getId());
    notificationDAO.put(notification);
  }
}
