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
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.util.Auth;
import net.nanopay.contacts.Contact;
import net.nanopay.model.Invitation;
import net.nanopay.model.InvitationStatus;

import java.util.Date;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;

public class AuthenticatedInvitationDAO
  extends ProxyDAO
{
  public AuthService auth_ = null;

  public AuthenticatedInvitationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    auth_ = (AuthService) x.get("auth");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invitation invite = (Invitation) obj;

    if ( invite == null ) {
      throw new RuntimeException("Cannot put null");
    }

    invite = (Invitation) invite.fclone();
    Invitation existingInvite = (Invitation) getDelegate().find_(x, invite);

    if ( existingInvite != null ) {
      if ( auth_.check(x, "*") ) return super.put_(x, obj);

      this.checkPermissions(x, existingInvite);

      // Valid business case #1: User is responding to an invite
      User user = this.getUser(x);
      boolean isRespondingToInvite =
          existingInvite.getStatus() == InvitationStatus.SENT &&
          (invite.getStatus() == InvitationStatus.ACCEPTED ||
          invite.getStatus() == InvitationStatus.IGNORED) &&
          existingInvite.getInviteeId() == user.getId();

      if ( isRespondingToInvite ) {
        InvitationStatus status = invite.getStatus();
        this.copyReadOnlyFields(existingInvite, invite);
        invite.setStatus(status);
        return getDelegate().put_(x, invite);
      }

      // Note to developer: If you're adding a feature that requires that users
      // be able to put to this DAO from the client, add a conditional statement
      // above that allows only the specific properties through that are
      // required for your feature, but only under the conditions that it makes
      // sense to do so.

    } else {
      this.prepareNewInvite(x, invite);
    }

    return super.put_(x, invite);
  }

  @Override
  public FObject find_(X x, Object id) {
    Invitation invite = (Invitation) getDelegate().find_(x, id);

    if ( invite == null ) return null;

    this.checkPermissions(x, invite);
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
    DAO dao = this.getSecureDAO(x);
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    Invitation invite = (Invitation) obj;

    if ( invite == null ) return null;

    this.checkPermissions(x, invite);
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
    DAO dao = this.getSecureDAO(x);
    dao.removeAll_(x, skip, limit, order, predicate);
  }

  public void checkPermissions(X x, Invitation invite) {
    User user = this.getUser(x);
    boolean hasPermission = auth_.check(x, "*") || this.isOwner(user, invite);

    if ( ! hasPermission ) {
      throw new AuthorizationException();
    }
  }

  public DAO getSecureDAO(X x) {
    if ( auth_.check(x, "*") ) return getDelegate();
    User user = this.getUser(x);
    long id = user.getId();
    return getDelegate().where(OR(
        EQ(Invitation.CREATED_BY, id),
        EQ(Invitation.INVITEE_ID, id)));
  }

  public User getUser(X x) {
    User user = (User) x.get("user");
    if ( user == null ) {
      throw new AuthenticationException();
    }
    return user;
  }

  public boolean isOwner(User user, Invitation invite) {
    long id = user.getId();
    return invite.getInviteeId() == id || invite.getCreatedBy() == id;
  }

  // TODO: This probably shouldn't be happening in this decorator.
  public void prepareNewInvite(X x, Invitation invite) {
    User user = this.getUser(x);

    AuthService auth = (AuthService) x.get("auth");
    if ( invite.getCreatedBy() != user.getId() && ! auth.check(x, "*") ) {
      throw new AuthorizationException("If you want to create a new invite, you " +
          "have to set `createdBy` to the id of the current user.");
    }

    if ( user.getEmail().equals(invite.getEmail()) )  {
      throw new AuthorizationException("You cannot invite yourself.");
    }

    // Check if invitee is a contact, an external user, or an internal user.
    DAO contactDAO = user.getContacts(x);
    User recipient = this.getUserByEmail(contactDAO.inX(x), invite.getEmail());
    boolean isContact = recipient != null;
    boolean internal = false;
    if ( ! isContact ) {
      DAO localUserUserDAO = (DAO) x.get("localUserUserDAO");
      recipient = this.getUserByEmail(localUserUserDAO.inX(x), invite.getEmail());
      internal = recipient != null;
    }

    long createdBy = invite.getCreatedBy();
    String email = invite.getEmail();
    String message = invite.getMessage();
    this.copyReadOnlyFields(new Invitation(), invite);
    invite.setCreatedBy(createdBy);
    invite.setEmail(email);
    invite.setInternal(internal);
    invite.setIsContact(isContact);
    invite.setMessage(message);
    invite.setStatus(InvitationStatus.SENT);

    // Set to date in distant past so that SendInvitationDAO will send the
    // email
    invite.setTimestamp(new Date(0L));

    if ( recipient != null ) invite.setInviteeId(recipient.getId());
  }

  public User getUserByEmail(DAO userDAO, String emailAddress) {
    return (User) userDAO.find(EQ(User.EMAIL, emailAddress));
  }

  public void copyReadOnlyFields(Invitation from, Invitation to) {
    to.setCreatedBy(from.getCreatedBy());
    to.setInviteeId(from.getInviteeId());
    to.setEmail(from.getEmail());
    to.setId(from.getId());
    to.setInternal(from.getInternal());
    to.setTimestamp(from.getTimestamp());
    to.setMessage(from.getMessage());
  }
}
