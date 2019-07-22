package net.nanopay.partners;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.notification.Notification;
import net.nanopay.model.Invitation;
import net.nanopay.model.InvitationStatus;

public class MakeConnectionDAO
  extends ProxyDAO
{
  public MakeConnectionDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invitation invite = (Invitation) obj.fclone();

    // Check if status is set appropriately
    boolean accepted = invite.getStatus() == InvitationStatus.ACCEPTED;
    boolean ignored = invite.getStatus() == InvitationStatus.IGNORED;
    if ( ! (accepted || ignored) ) {
      return super.put_(x, obj);
    }

    // Set status
    invite.setStatus(InvitationStatus.COMPLETED);

    // Add as partners
    User user = (User) x.get("user");
    DAO userDAO = (DAO) x.get("localUserDAO");
    User sender = (User) userDAO.find_(x, invite.getCreatedBy());
    user.getPartners(x).add(sender);

    // Send notification if accepted
    if ( accepted ) {
      DAO notificationDAO = (DAO) x.get("localNotificationDAO");
      Notification notification = new Notification();
      notification.setUserId(sender.getId());
      notification.setBody(user.getLegalName() +
          " accepted your request to connect.");
      notification.setNotificationType("Partner invitation result");
      notificationDAO.put_(x, notification);
    }

    return super.put_(x, invite);
  }
}
