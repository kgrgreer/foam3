package net.nanopay.invite;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.email.EmailTokenService;
import net.nanopay.invite.model.Invitation;

public class InvitationEmailDAO
    extends ProxyDAO
{
  protected DAO userDAO_;
  protected EmailTokenService inviteToken_;

  public InvitationEmailDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
    inviteToken_ = (EmailTokenService) x.get("inviteToken");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invitation invitation = (Invitation) obj;
    boolean newInvitation = getDelegate().find(invitation.getId()) == null;

    // send welcome email if new invitation
    Invitation result = (Invitation) super.put_(x, invitation);
    if ( result != null && result.getUser() != null && newInvitation ) {
      inviteToken_.generateToken(result.getUser());
    }

    return result;
  }
}