/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.partners.ui',
  name: 'PartnerInvitationNotificationCitationViewNotificationView',
  extends: 'foam.nanos.notification.NotificationCitationView',

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'notify',
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
        this.notify(this.AlreadyAccepted, '', this.LogLevel.INFO, true);
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
        this.notify(this.InviteNotFound, '', this.LogLevel.ERROR, true);
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
        this.notify(this.ErrorFromBackend, '', this.LogLevel.ERROR, true);
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
      this.notify(message, '', this.LogLevel.INFO, true);
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
      message: 'There was a problem connecting you'
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
