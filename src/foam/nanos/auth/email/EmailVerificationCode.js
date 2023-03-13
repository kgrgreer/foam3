/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'EmailVerificationCode',
  ids: [ 'email', 'userName' ],

  mixins: [
    'foam.nanos.analytics.Analyticable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  documentation: 'Model used to verify user email by code',

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.email.VerificationCodeException',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.FragmentedTextField',
    'foam.u2.FragmentedTextFieldFragment'
  ],

  imports: [
    'ctrl',
    'emailVerificationService',
    'pushMenu'
  ],

  messages: [
    { name: 'SUCCESS_MSG', message: 'Email verified.' },
    { name: 'ERROR_MSG', message: 'Email verification failed.' },
    { name: 'TITLE', message: 'Let\'s verify your email address' },
    { name: 'INSTRUCTION', message: 'We have sent a verification code to your email. Please enter the code below to confirm that this account belongs to you.' },
    { name: 'VERIFICATION_EMAIL_TITLE', message: 'Verification Email Sent'},
    { name: 'RESEND_ERROR_MSG', message: 'There was an issue with resending your verification email.' },
    { name: 'VERIFICATION_EMAIL', message: 'Email sent to' },
    { name: 'EMPTY_CODE',       message: 'Please enter the 6-digit code sent to your email' },
    { name: 'INVALID_CODE',     message: 'There was a problem resetting your password. Remaining attempts: ' },
    { name: 'NO_ATTEMPTS_LEFT', message: 'You have exceeded the verification attempt limit for this code. A new code has been sent to your email.' }
  ],

  sections: [
    {
      name: '_defaultSection',
      permissionRequired: true
    },
    { name: 'verificationCodeSection' }
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
      name: 'verificationCode',
      section: 'verificationCodeSection',
      view: function(_, X) {
        var delegates = Array(6).fill(X.data.FragmentedTextFieldFragment.create({ maxLength: 1 }, X));
        delegates = [].concat(...delegates.map(n => [n, ' '])).slice(0, -1);
        return X.data.FragmentedTextField.create({ delegates: delegates }, X);
      },
      validateObj: function(verificationCode, codeVerified, remainingAttempts) {
        if ( ! verificationCode || verificationCode.length != 6 )
          return this.EMPTY_CODE;
        if ( codeVerified ) return;
        if ( remainingAttempts > 0 ) return this.INVALID_CODE + remainingAttempts;
        return this.NO_ATTEMPTS_LEFT;
      }
    },
    {
      class: 'String',
      name: 'email',
      required: true,
      hidden: true
    },
    {
      class: 'String',
      name: 'userName',
      required: true,
      hidden: true
    },
    {
      class: 'DateTime',
      name: 'expiry',
      hidden: true
    },
    {
      class: 'Int',
      name: 'maxAttempts',
      value: 5,
      hidden: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      hidden: true
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
    },
    {
      class: 'Boolean',
      name: 'showAction',
      hidden: true
    }
  ],

  methods: [
    function init() {
      this.verificationCode$.sub(() => this.verifyCode());
    }
  ],

  listeners: [
    {
      name: 'verifyCode',
      mergeDelay: 100,
      code: async function() {
        if ( ! this.verificationCode || this.verificationCode.length != 6 ) {
          this.codeVerified = false;
          return;
        }

        try {
          var verified = await  this.emailVerificationService.verifyCode(x, this.email, this.userName, this.verificationCode);
          this.report('^verify-success', ['email-verification']);
          this.assert(verified, 'verified should be true when no exception was thrown')
          this.codeVerified = verified;
        } catch (error) {
          this.report('^verify-failure', error);
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
      name: 'submit',
      buttonStyle: 'PRIMARY',
      section: 'verificationCodeSection',
      isAvailable: function(showAction) {
        return showAction;
      },
      isEnabled: function(codeVerified) {
        return codeVerified;
      },
      code: async function() {
        var success, err;
        if ( ! this.codeVerified ) return;
        try {
          success = await this.emailVerificationService.verifyUserEmail(null, this.email, this.userName, this.verificationCode);
        } catch ( error ) {
          err = error;
        }
        if ( success ) {
          this.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_MSG,
            type: this.LogLevel.INFO
          }));
          this.pushMenu('');
        } else {
          this.ctrl.add(this.NotificationMessage.create({
            message: this.ERROR_MSG,
            type: this.LogLevel.ERROR,
            err: err?.data
          }));
          throw err;
        }
      }
    },
    {
      name: 'resendCode',
      section: 'verificationCodeSection',
      isAvailable: function(codeVerified) {
        return ! codeVerified;
      },
      buttonStyle: 'TEXT',
      code: async function() {
        this.report('^resend-verification');
        if ( this.codeVerified ) return;
        try {
          await this.emailVerificationService.verifyByCode(null, this.email, this.userName, '');
          this.ctrl.add(this.NotificationMessage.create({
            message: this.VERIFICATION_EMAIL_TITLE,
            description: this.VERIFICATION_EMAIL+ ' ' + this.email,
            type: this.LogLevel.INFO
          }));
          return true;
        } catch ( err ) {
          this.error('^resend-verification-failed', err);
          this.assert('false', 'exception when resending verification', err.message);
          this.ctrl.add(this.NotificationMessage.create({
            err: err.data,
            message: this.RESEND_ERROR_MSG,
            type: this.LogLevel.ERROR
          }));
          return false;
        }
      }
    }
  ]
});
