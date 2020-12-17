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
  package: 'net.nanopay.admin.ui',
  name: 'ResendInviteModal',
  extends: 'foam.u2.Controller',

  documentation: 'Resend invite modal',

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.ui.modal.ModalHeader'
  ],

  imports: [
    'inviteToken',
    'editProfilePopUp',
    'closeDialog',
    'notify'
  ],

  css: `
    ^ {
      width: 448px;
      margin: auto;
    }
    ^ .content {
      padding: 20px;
      margin-top: -20px;
    }
    ^ .description {
      font-size: 12px;
      text-align: center;
      margin-bottom: 60px;
    }
    ^ .foam-u2-ActionView {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      overflow: hidden;
      zoom: 1;
    }
    ^ .foam-u2-ActionView-resend {
      background-color: #59a5d5;
      color: white;
      display: inline-block;
      float:right;
    }
    ^ .foam-u2-ActionView-resend:hover,
    ^ .foam-u2-ActionView-resend:focus {
      background-color: #357eac;
    }
  `,

  properties: [
    'data',
    ['title', 'Resend Invite']
  ],

  messages: [
    { name: 'Description', message: 'Are you sure you want to resend this invitation?' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      if (this.editProfilePopUp) this.editProfilePopUp.remove();

      this
        .addClass(this.myClass())
        .tag(this.ModalHeader.create({ title: this.title }))
        .start('div').addClass('content')
          .start('p').addClass('description').add(this.Description).end()
          .start()
            .start(this.CANCEL).end()
            .start(this.RESEND).end()
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function (X) {
        X.closeDialog();
      }
    },
    {
      name: 'resend',
      code: function (X) {
        var self = this;

        this.inviteToken.generateToken(null, this.data).then(function (result) {
          if ( ! result ) throw new Error('Unable to resend invitation.');
          X.closeDialog();
          X.notify('Invitation successfully resent.', '', self.LogLevel.INFO, true);
        })
        .catch(function (err) {
          X.notify('Unable to resend invitation.', '', self.LogLevel.ERROR, true);
        });
      }
    }
  ]
});