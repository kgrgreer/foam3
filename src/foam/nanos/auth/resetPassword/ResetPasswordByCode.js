/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'ResetPasswordByCode',
  extends: 'foam.nanos.auth.resetPassword.ResetPassword',

  mixins: [
    'foam.nanos.analytics.Analyticable'
  ],

  documentation: 'Reset Password By Code Model',

  imports: [
    'ctrl',
    'emailVerificationService',
    'resetPasswordService'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.email.VerificationCodeException',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.FragmentedTextField',
    'foam.u2.FragmentedTextFieldFragment'
  ],

  sections: [
    {
      name: 'verificationCodeSection'
    },
    {
      name: 'resetPasswordSection'
    }
  ],

  messages: [
    { name: 'INSTRUC_TITLE',    message: 'Verification code sent' },
    { name: 'INSTRUC',          message: 'Please check your inbox to reset your password' },
    { name: 'RESEND_ERROR_MSG', message: 'There was an issue resending your verification code' },
    { name: 'EMPTY_CODE',       message: 'Please enter the 6-digit code sent to your email' },
    { name: 'INVALID_CODE',     message: 'There was a problem resetting your password. Remaining attempts: ' },
    { name: 'NO_ATTEMPTS_LEFT', message: 'You have exceeded the verification attempt limit for this code. A new code has been sent to your email.' }
  ],

  css: `
    .foam-u2-detail-SectionView .foam-u2-detail-SectionView-actionDiv {
      justify-content: center;
    }
    .foam-u2-detail-SectionView .foam-u2-ActionView-resendCode {
      padding: 0;
    }
    
    .foam-u2-dialog-ApplicationPopup-bodyWrapper .subTitle {
      text-align: center;
    }
    .foam-u2-dialog-ApplicationPopup-bodyWrapper .foam-u2-detail-SectionView-verificationCodeSection {
      width: fit-content;
      align-self: center
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'email',
      hidden: true
    },
    {
      class: 'String',
      name: 'userName',
      hidden: true
    },
    {
      class: 'String',
      name: 'resetPasswordCode',
      label: 'Verification Code',
      section: 'verificationCodeSection',
      required: true,
      view: function(_, X) {
        var delegates = Array(6).fill(X.data.FragmentedTextFieldFragment.create({ maxLength: 1 }, X));
        delegates = [].concat(...delegates.map(n => [n, ' '])).slice(0, -1);
        return X.data.FragmentedTextField.create({ delegates: delegates }, X);
      },
      validateObj: function(resetPasswordCode, codeVerified, remainingAttempts) {
        if ( ! resetPasswordCode || resetPasswordCode.length != 6 )
          return this.EMPTY_CODE;
        if ( codeVerified ) return;
        if ( remainingAttempts > 0 ) return this.INVALID_CODE + remainingAttempts;
        return this.NO_ATTEMPTS_LEFT;
      }
    },
    {
      name: 'newPassword',
      section: 'resetPasswordSection'
    },
    {
      name: 'confirmationPassword',
      section: 'resetPasswordSection'
    },
    {
      class: 'Boolean',
      name: 'codeVerified',
      documentation: `
        Updated by verifyCode method whenever code is updated and of valid format.
      `,
      section: 'verificationCodeSection',
      hidden: true
    },
    {
      name: 'remainingAttempts',
      documentation: `
        Number of remaining attempts to enter current verification code.
        Used in resetPasswordCode error message.
      `,
      section: 'verificationCodeSection',
      hidden: true
    }
  ],

  methods: [
    function init() {
      this.resetPasswordCode$.sub(() => this.verifyCode());
    }
  ],

  listeners: [
    {
      name: 'verifyCode',
      mergeDelay: 100,
      code: async function() {
        if ( ! this.resetPasswordCode || this.resetPasswordCode.length != 6 ) {
          this.codeVerified = false;
          return;
        }

        try {
          var verified = await  this.emailVerificationService.verifyCode(x, this.email, this.userName, this.resetPasswordCode);
          this.report('^verify-success', ['email-verification']);
          this.assert(verified, 'verified should be true when no exception was thrown')
          this.codeVerified = verified;

          // Clear new/confirmation passwords after the reset password
          // code is verified and user must re-enter the password fields.
          if ( this.codeVerified ) {
            this.clearProperty('newPassword');
            this.clearProperty('confirmationPassword');
          }
        } catch (error) {
          this.report('^verify-failure', ['email-verification'], {
            errorAsString: error.toString()
          });
          if ( error?.data?.exception && this.VerificationCodeException.isInstance(error.data.exception) ) {
            this.remainingAttempts = error.data.exception.remainingAttempts;
            this.codeVerified = false;
            if ( ! this.remainingAttempts ) {
              this.resendCode();
            }
          }
        }
      }
    }
  ],

  actions: [
    {
      name: 'resetPassword',
      label: 'Confirm',
      section: 'resetPasswordSection',
      isEnabled: function (errors_) {
        return ! errors_;
      },
      isAvailable: function (showSubmitAction) {
        return showSubmitAction
      },
      code: async function (X) {
        try {
          await this.resetPasswordService.resetPassword(null, this);
        } catch (err) {
          this.ctrl.add(this.NotificationMessage.create({
            err: err.data,
            message: this.ERROR_MSG,
            type: this.LogLevel.ERROR,
            transient: true
          }));
          throw err;
        }
        this.ctrl.add(this.NotificationMessage.create({
          message: this.SUCCESS_MSG_TITLE,
          description: this.SUCCESS_MSG,
          type: this.LogLevel.INFO,
          transient: true
        }));
      }
    },
    {
      name: 'resendCode',
      label: 'Resend Code',
      section: 'verificationCodeSection',
      buttonStyle: 'TEXT',
      isAvailable: function(codeVerified) {
        return ! codeVerified;
      },
      code: async function() {
        this.report('^resend-verification');
        try {
          await this.resetPasswordService.resetPasswordByCode(null, this.email, this.username);

          this.ctrl.add(this.NotificationMessage.create({
            message: this.INSTRUC_TITLE,
            description: this.INSTRUC,
            type: this.LogLevel.INFO,
            transient: true
          }));
        } catch(err) {
          this.assert('false', 'exception when resending verification', err.message);
          if ( this.UserNotFoundException.isInstance(err.data.exception) ) {
              this.ctrl.add(this.NotificationMessage.create({
                err: err.data,
                type: this.LogLevel.ERROR,
                transient: true
              }));
              return;
          }
          this.ctrl.add(this.NotificationMessage.create({
            message: this.RESEND_ERROR_MSG,
            type: this.LogLevel.ERROR,
            transient: true
          }));
          throw err;
        }
      }
    }
  ]
});
