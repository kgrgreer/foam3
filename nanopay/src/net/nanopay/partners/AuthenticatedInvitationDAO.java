package net.nanopay.partners;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import net.nanopay.model.Invitation;

import java.security.AccessControlException;

import static foam.mlang.MLang.*;

public class AuthenticatedInvitationDAO
  extends ProxyDAO
{
  public final static String GLOBAL_INVITATION_READ = "invitation.read.x";
  public final static String GLOBAL_INVITATION_UPDATE = "invitation.update.x";
  public final static String GLOBAL_INVITATION_DELETE = "invitation.delete.x";

  public AuthenticatedInvitationDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public AuthenticatedInvitationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = this.getUser(x);
    Invitation invite = (Invitation) obj;

    this.checkPermissions(x, user, invite, GLOBAL_INVITATION_UPDATE);

    // Make fields `createdBy` and `inviteeId` read-only
    Invitation existingInvite = this.getExistingInvite(invite);

    if ( existingInvite != null ) {
      invite.setCreatedBy(existingInvite.getCreatedBy());
      invite.setInviteeId(existingInvite.getInviteeId());
    }

    return super.put_(x, invite);
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = this.getUser(x);
    Invitation invite = (Invitation) getDelegate().find_(x, id);

    if ( invite == null ) return null;

    this.checkPermissions(x, user, invite, GLOBAL_INVITATION_READ);
    return invite;
  }

  @Override
  public Sink select_(
      X x,
      Sink sink,
      long skip,
      long limit,
      Comparator order,
      Predicate predicate
  ) {
    User user = this.getUser(x);
    DAO dao = this.getDao(x, user.getId(), GLOBAL_INVITATION_READ);
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User user = this.getUser(x);
    Invitation invite = (Invitation) obj;

    if ( invite == null ) return null;

    this.checkPermissions(x, user, invite, GLOBAL_INVITATION_DELETE);
    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(
      X x,
      long skip,
      long limit,
      Comparator order,
      Predicate predicate
  ) {
    User user = this.getUser(x);
    DAO dao = this.getDao(x, user.getId(), GLOBAL_INVITATION_DELETE);
    dao.removeAll_(x, skip, limit, order, predicate);
  }

  protected void checkPermissions(
      X x,
      User user,
      Invitation invite,
      String permission
  ) {
    AuthService auth = (AuthService) x.get("auth");
    boolean hasPermission =
        this.isOwner(user, invite) || auth.check(x, GLOBAL_INVITATION_READ);

    if ( ! hasPermission ) {
      throw new RuntimeException("Permission denied");
    }
  }

  protected Invitation getExistingInvite(Invitation invite) {
    long inviterId = invite.getCreatedBy();
    long inviteeId = invite.getInviteeId();
    ArraySink existingInvites = (ArraySink) getDelegate()
        .where(AND(
          EQ(Invitation.CREATED_BY, inviterId),
          EQ(Invitation.INVITEE_ID, inviteeId)))
        .limit(1)
        .select(new ArraySink());
    boolean inviteExists = existingInvites.getArray().size() == 1;
    return inviteExists ? (Invitation) existingInvites.getArray().get(0) : null;
  }

  protected DAO getDao(X x, long id, String permission) {
    AuthService auth = (AuthService) x.get("auth");
    boolean hasGlobalPermission = auth.check(x, permission);
    return hasGlobalPermission
      ? getDelegate()
      : getDelegate().where(OR(
          EQ(Invitation.CREATED_BY, id),
          EQ(Invitation.INVITEE_ID, id)));
  }

  protected User getUser(X x) {
      User user = (User) x.get("user");
      if ( user == null ) {
        throw new AccessControlException("User is not logged in");
      }
      return user;
  }

  protected boolean isOwner(User user, Invitation invite) {
    boolean isInvitee = user.getId() == invite.getInviteeId();
    boolean isInviter = user.getId() == invite.getCreatedBy();
    return isInvitee || isInviter;
  }
}
