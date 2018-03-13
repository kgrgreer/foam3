foam.CLASS({
  package: 'net.nanopay.invite',
  name: 'InvitationEmailDAO',
  extends: 'foam.dao.ProxyDAO',

  imports: [
    'inviteToken'
  ],

  javaImports: [
    'foam.nanos.auth.email.EmailTokenService',
    'net.nanopay.invite.model.Invitation'
  ],

  methods: [
    {
      name: 'put_',
      javaCode:
`Invitation invitation = (Invitation) obj;
boolean newInvitation = getDelegate().find(invitation.getId()) == null;

// send welcome email if new invitation
Invitation result = (Invitation) super.put_(x, invitation);
if ( result != null && result.getUser() != null && newInvitation ) {
  ((EmailTokenService) getInviteToken()).generateToken(result.getUser());
}

return result;`
    }
  ]
});