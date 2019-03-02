foam.CLASS({
  package: 'net.nanopay.partners.ui',
  name: 'PartnerInvitationNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus'
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
        .start('div')
          .addClass('msg')
          .add(`${this.data.inviterName} invited you to connect.`)
        .end()
        .tag(this.CONNECT);
    },

    /**
     * Respond to an invitation
     * @param {InvitationStatus} status The response to use
     */
    async function respondToInvitation(status) {
      var invite = await this.getInvitation();
      if ( this.hasBeenRespondedTo(invite) ) {
        this.add(this.NotificationMessage.create({
          message: this.AlreadyAccepted
        }));
        return;
      }
      invite.status = status;
      await this.sendInvitation(invite);
      this.sendSuccessNotificationMessage(status);
    },

    /**
     * Get the relevant invitation from the DAO
     * @returns {Invitation}
     */
    async function getInvitation() {
      let result = null;

      // if invitation id provided
      if ( this.data.invitationId ) {
        result =
          await this.invitationDAO.find(this.data.invitationId);

        // if no invitation id
      } else {
        let selectedResult = await this.invitationDAO.where(
          this.AND(
            this.EQ(this.Invitation.INVITEE_ID, this.user.id),
            this.EQ(this.Invitation.CREATED_BY, this.data.createdBy)
          )).select();
        let size = selectedResult.array.length;
        result = selectedResult.array[size - 1];
      }

      if ( ! this.Invitation.isInstance(result) ) {
        this.add(this.NotificationMessage.create({
          message: this.InviteNotFound,
          type: 'error'
        }));
        throw new Error(`Invitation not found`);
      }
      return result;
    },

    /**
     * Check if an invitation has already been responded to by the invitee
     * @param {Invitation} invitation An invitation to check
     * @returns {Boolean} True if the invitee has responded to the invitation
     */
    function hasBeenRespondedTo(invitation) {
      return invitation.status !== this.InvitationStatus.SENT;
    },

    /**
     * Send an invitation
     * @param {Invitation} invitation An invitation to send
     */
    async function sendInvitation(invitation) {
      try {
        await this.invitationDAO.put(invitation);
      } catch (err) {
        this.add(this.NotificationMessage.create({
          message: this.ErrorFromBackend,
          type: 'error'
        }));
        throw err;
      }
    },

    /**
     * Notify the user that their response went through correctly
     * @param {InvitationStatus} status Their response to the invitation
     */
    function sendSuccessNotificationMessage(status) {
      var message;
      switch ( status ) {
        case this.InvitationStatus.ACCEPTED:
          message = this.Connected;
          break;
        default:
          throw new Error(`Unsupported response type: ${status}`);
      }
      this.add(this.NotificationMessage.create({ message: message }));
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
      message: `You've already accepted this request`
    }
  ],

  actions: [
    {
      name: 'connect',
      label: 'Connect',
      code: function() {
        this.respondToInvitation(this.InvitationStatus.ACCEPTED);
      }
    }
  ]
});
