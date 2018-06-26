package net.nanopay.partners;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.notification.Notification;
import net.nanopay.model.Invitation;
import net.nanopay.model.InvitationStatus;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class MakeConnectionDAO
  extends ProxyDAO
{
  public MakeConnectionDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  private Invitation getInvitation(long inviterId, long inviteeId) {
    ArraySink existingInvites = (ArraySink) this
        .where(AND(
          EQ(Invitation.CREATED_BY, inviterId),
          EQ(Invitation.INVITEE_ID, inviteeId)))
        .limit(1)
        .select(new ArraySink());
    boolean inviteExists = existingInvites.getArray().size() == 1;
    return inviteExists ? (Invitation) existingInvites.getArray().get(0) : null;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invitation givenInvite = (Invitation) obj;

    // Check if status and createdBy are set appropriately
    boolean createdByIsValid = givenInvite.getCreatedBy() != 0;
    boolean accepted = givenInvite.getStatus() == InvitationStatus.ACCEPTED;
    boolean ignored = givenInvite.getStatus() == InvitationStatus.IGNORED;
    if ( ! createdByIsValid || ! (accepted || ignored) ) {
      return super.put_(x, obj);
    }

    // Check if there actually is an invitation from createdBy to the current
    // user.
    DAO userDAO = (DAO) x.get("localUserDAO");
    User user = (User) x.get("user");
    user = (User) user.fclone();
    user.setX(x);
    Invitation invite = getInvitation(givenInvite.getCreatedBy(), user.getId());
    if ( invite == null ) {
      throw new RuntimeException("Tried to put a status change for an " +
          "invitation that doesn't exist.");
    }

    User sender = (User) userDAO.find_(x, invite.getCreatedBy());

    // Set status
    InvitationStatus newStatus = accepted
        ? InvitationStatus.CONNECTED
        : InvitationStatus.IGNORED;
    invite.setStatus(newStatus);

    // Add as partners
    user.getPartners().add(sender);

    // Send notification if accepted
    if ( accepted ) {
      DAO notificationDAO = (DAO) x.get("notificationDAO");
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
