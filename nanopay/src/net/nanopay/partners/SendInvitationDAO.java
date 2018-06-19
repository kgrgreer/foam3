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

/**
 * Handles all logic related to Invitations, including:
 *  - Only sending invite if not already invited in last 2 hours
 *  - Checking if this invited user is already on the platform or not and
 *    sending either an invite to join email or a request to connect email
 *    accordingly.
 */
public class SendInvitationDAO
  extends ProxyDAO
{
  public SendInvitationDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    DAO userDAO = (DAO) x.get("localUserDAO");
    Invitation invite = (Invitation) obj;
    User sender = (User) x.get("user");
    invite.setCreatedBy(sender.getId());
    // Set the timestamp on the invite here instead of on the frontend so it
    // can't be manually set by a tech-savvy user
    invite.setTimestamp(new Date());

    // See if the recipient is an existing user or not
    ArraySink usersWithMatchingEmail = (ArraySink) userDAO
        .where(EQ(User.EMAIL, invite.getEmail()))
        .limit(1)
        .select(new ArraySink());
    Boolean userExists = usersWithMatchingEmail.getArray().size() == 1;
    User recipient = userExists
        ? (User) usersWithMatchingEmail.getArray().get(0)
        : null;
    if ( userExists ) invite.setInviteeId(recipient.getId());
    invite.setInternal(userExists);

    // Find the last time an invite was sent to this user. Applies whether the
    // recipient exists or not because multiple invites could be sent before
    // they sign up.
    ArraySink previousInvites = (ArraySink) this
        .where(EQ(Invitation.EMAIL, invite.getEmail()))
        .orderBy(new foam.mlang.order.Desc(Invitation.TIMESTAMP))
        .limit(1)
        .select(new ArraySink());
    Boolean previouslyInvited = previousInvites.getArray().size() > 0;
    Invitation previousInvite = previouslyInvited
        ? (Invitation) previousInvites.getArray().get(0)
        : null;

    // Don't send the invitation if one has already been sent to that address
    // in the last 2 hours
    if ( previouslyInvited ) {
      TimeUnit hoursUnit = TimeUnit.HOURS;
      Date now = new Date();
      long diff = now.getTime() - previousInvite.getTimestamp().getTime();
      long diffInHours = hoursUnit.convert(diff, TimeUnit.MILLISECONDS);
      // NOTE: convert() will truncate down to the nearest full hour
      if ( diffInHours <= 2 ) {
        throw new RuntimeException("Cannot send invitation more than once every 2 hours");
      }
    }

    // Put to the DAO, then send email
    invite = (Invitation) super.put_(x, invite);

    AppConfig config = (AppConfig) x.get("appConfig");
    EmailService email = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    message.setTo(new String[]{invite.getEmail()});
    HashMap<String, Object> args = new HashMap<>();
    String url = config.getUrl();
    String urlPath = userExists ? "#notifications" : "#sign-up";

    args.put("message", invite.getMessage());

    args.put("inviterName", sender.getLegalName());
    args.put("link", url + urlPath);

    String template = userExists ? "partners-internal-invite" : "partners-external-invite";

    try {
      email.sendEmailFromTemplate(sender, message, template, args);
    } catch(Throwable t) {
      Logger logger = ((Logger) x.get(Logger.class));
      logger.error("Error sending invitation email.", t);
    }

    return invite;
  }
}