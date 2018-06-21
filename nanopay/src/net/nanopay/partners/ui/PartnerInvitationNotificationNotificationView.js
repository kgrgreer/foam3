foam.CLASS({
  package: 'net.nanopay.partners.ui',
  name: 'PartnerInvitationNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.model.Invitation',
    'net.nanopay.partners.InvitationStatus'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'user',
    'invitationDAO',
  ],

  exports: [
    'as data'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start(this.CONNECT).end();
    }
  ],

  messages: [
    {
      name: 'InviteNotFound',
      message: 'No invitation found'
    },
    {
      name: 'Connected',
      message: 'You are now connected!'
    },
    {
      name: 'ErrorFromBackend',
      message: 'There was a problem connecting you.'
    },
    {
      name: 'ErrorMultipleInvites',
      message: 'There were multiple invites'
    },
    {
      name: 'AlreadyAccepted',
      message: "You've already accepted this request"
    }
  ],

  actions: [
    {
      name: 'connect',
      label: 'Connect',
      code: async function() {
        var queryResult = await this.invitationDAO
            .where(this.AND(
                this.EQ(this.Invitation.INVITEE_ID, this.user.id),
                this.EQ(this.Invitation.CREATED_BY, this.data.createdBy)))
            .orderBy(this.DESC(this.Invitation.TIMESTAMP))
            .select();

        if ( queryResult.array.length === 0 ) {
          this.add(this.NotificationMessage.create({
            message: this.InviteNotFound,
            type: 'error'
          }));
          return;
        } else if ( queryResult.array.length > 1 ) {
          console.warn(`There are multiple invitations from user
              ${this.data.createdBy} to ${this.user.id}. There should only be
              one. The most recent one will be used.`);
        }

        var invite = queryResult.array[0];

        switch ( invite.status ) {
          case this.InvitationStatus.ACCEPTED:
          case this.InvitationStatus.CONNECTED:
            this.add(this.NotificationMessage.create({
              message: this.AlreadyAccepted
            }));
            return;
        }

        invite.status = this.InvitationStatus.ACCEPTED;

        try {
          await this.invitationDAO.put(invite);
        } catch (err) {
          console.log(err);
          this.add(this.NotificationMessage.create({
            message: this.ErrorFromBackend,
            type: 'error'
          }));
          return;
        }

        this.add(this.NotificationMessage.create({ message: this.Connected }));
      }
    }
  ]
})