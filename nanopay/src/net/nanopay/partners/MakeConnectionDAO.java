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
import foam.nanos.notification.Notification;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.concurrent.TimeUnit;
import java.util.Date;
import java.util.HashMap;

import net.nanopay.model.Invitation;
import net.nanopay.partners.InvitationStatus;

/** Connects two users if they've both agreed to it */
public class MakeConnectionDAO
  extends ProxyDAO
{
  public MakeConnectionDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    DAO userDAO = (DAO) x.get("localUserDAO");
    DAO notificationDAO = (DAO) x.get("notificationDAO");
    Invitation invite = (Invitation) obj;
    User user = (User) x.get("user");
    user = (User) user.fclone();
    user.setX(x);

    Boolean userIsRecipient = user.getId() == invite.getInviteeId();
    Boolean accepted = invite.getStatus() == InvitationStatus.ACCEPTED;
    Boolean ignored = invite.getStatus() == InvitationStatus.IGNORED;

    if ( ! userIsRecipient || ! (accepted || ignored) ) {
      return delegate_.put(invite);
    }

    User sender = (User) userDAO.find_(x, invite.getCreatedBy());

    InvitationStatus newStatus = accepted
        ? InvitationStatus.CONNECTED
        : InvitationStatus.IGNORED;

    invite.setStatus(newStatus);
    user.getPartners().add(sender);

    if ( accepted ) {
      // Send notification
      Notification notification = new Notification();
      notification.setUserId(sender.getId());
      notification.setBody(user.getLegalName() +
          " accepted your request to connect.");
      notification.setNotificationType("Partner invitation result");
      notificationDAO.put(notification);
    }

    return delegate_.put(invite);
  }
}