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
  package: 'net.nanopay.sme.ui',
  name: 'ConfirmDisable2FAModal',
  extends: 'foam.u2.Controller',

  documentation: 'A Popup modal to confirm user disabling 2FA',

  requires: [
    'foam.log.LogLevel'
  ],

  imports: [
    'subject',
    'closeDialog',
    'ctrl',
    'notify',
    'twofactor'
  ],

  css: `
    ^ {
      width: 504px;
    }

    ^top-container {
      padding: 24px;
    }

    ^title {
      font-size: 23px;
      font-weight: 800;
      color: /*%BLACK%*/ #1e1f21;
      margin: 0;
    }

    ^instructions {
      font-size: 14px;
      color: #525455;
      margin: 0;
      margin-top: 24px;
      margin-bottom: 16px;
    }

    ^instructions: last-child {
      margin-bottom: 0;
    }

    ^field-label {
      margin: 0;
      margin-top: 24px;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 12px;
    }

    ^field {
      width: 100%;
      height: 40px;
      padding: 10px 8px 10px 0px;
    }

    ^bottom-container {
      display: flex;
      width: 100%;
      padding: 24px;
      background-color: #fafafa;
      box-sizing: border-box;
    }

    ^action-container {
      margin-left: auto;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Are you sure?' },
    { name: 'INSTRUCTIONS_1', message: 'Two-factor authentication provides an added layer of security against impersonation and prevents access to sensitive account information' },
    { name: 'INSTRUCTIONS_2', message: 'We highly recommend it' },
    { name: 'FIELD_LABEL', message: 'Enter verification code' },
    { name: 'FIELD_PLACEHOLDER', message: 'Enter code' },
    { name: 'ERROR_NO_TOKEN', message: 'Please enter a verification token' },
    { name: 'ERROR_DISABLE', message: 'Could not disable two-factor authentication. Please try again.' },
    { name: 'SUCCESS', message: 'Two-factor authentication disabled' }
  ],

  properties: [
    {
      class: 'String',
      name: 'validationCode'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass(this.myClass('top-container'))
          .start('p').addClass(this.myClass('title'))
            .add(this.TITLE)
          .end()
          .start('p').addClass(this.myClass('instructions'))
            .add(this.INSTRUCTIONS_1)
          .end()
          .start('p').addClass(this.myClass('instructions'))
            .add(this.INSTRUCTIONS_2)
          .end()
          .start('p').addClass(this.myClass('field-label'))
            .add(this.FIELD_LABEL)
          .end()
          .start(this.VALIDATION_CODE).addClass(this.myClass('field'))
            .attrs({ 'placeholder': this.FIELD_PLACEHOLDER })
          .end()
        .end()
        .start().addClass(this.myClass('bottom-container'))
          .start().addClass(this.myClass('action-container'))
            .tag(this.CANCEL, { buttonStyle: 'TERTIARY' })
            .tag(this.DISABLE, { isDestructive: true })
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'disable',
      code: function() {
        var self = this;

        if ( ! self.validationCode ) {
          self.ctrl.notify(self.ERROR_NO_TOKEN, '', self.LogLevel.ERROR, true);
          return;
        }

        this.twofactor.disable(null, self.validationCode)
          .then(function(result) {
            if ( ! result ) {
              self.ctrl.notify(self.ERROR_DISABLE, '', self.LogLevel.ERROR, true);
              return;
            }

            self.validationCode = '';
            self.subject.realUser.twoFactorEnabled = false;
            self.ctrl.notify(self.SUCCESS, '', self.LogLevel.INFO, true);
            self.closeDialog();
          })
          .catch(function(err) {
            self.ctrl.notify(self.ERROR_DISABLE, '', self.LogLevel.ERROR, true);
          });
      }
    },
    {
      name: 'cancel',
      code: function() {
        this.closeDialog();
      }
    }
  ]
});
