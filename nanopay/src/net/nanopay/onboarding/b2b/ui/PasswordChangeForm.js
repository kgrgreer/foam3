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
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'PasswordChangeForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Password change form for onboarding',

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.admin.model.AccountStatus'
  ],

  imports: [
    'notify',
    'user',
    'userDAO',
    'stack',
    'auth',
    'validatePassword'
  ],

  properties: [
    {
      class: 'String',
      name: 'originalPassword'
    },
    {
      class: 'String',
      name: 'newPassword'
    },
    {
      class: 'String',
      name: 'confirmPassword'
    }
  ],

  css: `
    ^ {
      padding-bottom: 40px;
    }
    ^ p{
      font-size: 14px;
      font-weight: bold;
    }
    ^ .description{
      font-size: 12px;
      font-weight: normal;
    }
    ^ .line{
      width: 70%;
      height: 1px;
      background: rgba(164, 179, 184, 0.5);
    }
    ^ .container-1{
      margin: 20px 0px;
    }
    ^ .label{
      margin-left: 0;
      margin-top: 30px;
      font-size: 14px;
    }
    ^ .foam-u2-TextField{
      width: 540px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding-left: 10px;
    }
    ^ .account-status{
      position: relative;
      display: inline-block;
    }
    ^ .generic-status{
      display: inline-block;
      border-radius: 30px;
      margin-left: 20px;
      padding: 3px 7px;
    }
    ^ .status{
      top: -30px;
      position: relative;
    }
    ^ .foam-u2-ActionView{
      width: 540px;
      height: 40px;
      background-color: #59a5d5;
      color: white;
      margin-top: 30px;
    }
  `,

  messages: [
    { name: 'emptyOriginal', message: 'Please enter your original password' },
    { name: 'emptyPassword', message: 'Please enter your new password' },
    { name: 'emptyConfirmation', message: 'Please re-enter your new password' },
    { name: 'invalidPassword', message: 'Password must be at least 6 characters long' },
    { name: 'passwordMismatch', message: 'Passwords do not match' },
    { name: 'passwordSuccess', message: 'Password successfully updated' },
    { name: 'passwordDescription', message: 'Please change you password before you start using the nanopay platform.'}
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start().addClass('status')
          .start('p').addClass('account-status').add('Account ID ' + this.user.id).end()
          .start().addClass('generic-status').addClass('Invoice-Status-Paid').add('Active').end()
        .end()
        .start().addClass('line').end()
        .start().addClass('Container')
          .start('div').addClass('container-1')
            .start('p').add('Next Step - Change Your Password').end()
            .start('p').add(this.passwordDescription).addClass('description').end()
          .end()
          .start('div')
            .start('h2').add('Original Password').addClass('label').end()
            .start(this.ORIGINAL_PASSWORD).attrs({ 'type': 'password' }).end()
            .start('h2').add('New Password').addClass('label').end()
            .start(this.NEW_PASSWORD).attrs({ 'type': 'password' }).end()
            .start('h2').add('Confirm Password').addClass('label').end()
            .start(this.CONFIRM_PASSWORD).attrs({ 'type': 'password' }).end()
          .end()
          .start(this.CHANGE_PASSWORD).addClass('update-BTN').end()
        .end()
    }
  ],

  actions: [
    {
      name: 'changePassword',
      code: function() {
        var self = this;

        // check if original password entered
        if ( ! this.originalPassword ) {
          this.notify(this.emptyOriginal, '', this.LogLevel.ERROR, true);
          return;
        }

        // validate new password
        if ( ! this.newPassword ) {
          this.notify(this.emptyPassword, '', this.LogLevel.ERROR, true);
          return;
        }

        if ( ! this.validatePassword(this.newPassword) ) {
          this.notify(this.invalidPassword, '', this.LogLevel.ERROR, true);
          return;
        }

        // check if confirmation entered
        if ( ! this.confirmPassword ) {
          this.notify(this.emptyConfirmation, '', this.LogLevel.ERROR, true);
          return;
        }

        // check if passwords match
        if ( ! this.confirmPassword.trim() || this.confirmPassword !== this.newPassword ) {
          this.notify(this.passwordMismatch, '', this.LogLevel.ERROR, true);
          return;
        }

        this.user.createdPwd = true;
        this.user.onboarded = true;
        this.userDAO.put(this.user).then( function(result) {
          self.auth.updatePassword(null, self.originalPassword, self.newPassword).then(function(a) {
            self.notify(self.passwordSuccess, '', self.LogLevel.INFO, true);
            this.window.location.hash = '';
            this.window.location.reload();
          }).catch(function(err) {
            self.notify(err.message, '', self.LogLevel.ERROR, true);
          });
        })
        .catch( function(err) {
          self.notify(err.message, '', self.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
