foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'PersonalSettingsView',
  extends: 'foam.u2.View',

  documentation: 'Personal settings page for sme',

  imports: [
    'auth',
    'user',
    'stack',
    'userDAO',
  ],

  exports: [ 'as data' ],

  requires: [
    'net.nanopay.ui.ExpandContainer',
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
    ^ {
      margin: 50px;
    }
    ^password-wrapper {
      width: 300px;
      display: inline-block;
      margin-right: 50px;
    }
    ^change-password-card {
      padding: 24px;
    }
    ^change-password-content {
      margin-bottom: 15px;
    }
    ^ .input-field {
      background: white;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'originalPassword',
      view: { class: 'foam.u2.view.PasswordView' }
    },
    {
      class: 'String',
      name: 'newPassword',
      view: { class: 'foam.u2.view.PasswordView' }
    },
    {
      class: 'String',
      name: 'confirmPassword',
      view: { class: 'foam.u2.view.PasswordView' }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Personal Settings' },
    { name: 'noSpaces', message: 'Password cannot contain spaces' },
    { name: 'noNumbers', message: 'Password must have one numeric character' },
    { name: 'noSpecial', message: 'Password must not contain: !@#$%^&*()_+' },
    { name: 'emptyOriginal', message: 'Please enter your original password' },
    { name: 'emptyPassword', message: 'Please enter your new password' },
    { name: 'emptyConfirmation', message: 'Please re-enter your new password' },
    { name: 'invalidLength', message: 'Password must be 7-32 characters long' },
    { name: 'passwordMismatch', message: 'Passwords do not match' },
    { name: 'passwordSuccess', message: 'Password successfully updated' }
  ],

  methods: [
    function initE() {
      this
      .addClass(this.myClass())
      .start('h1').add(this.TITLE).end()

      .start().addClass('card').addClass(this.myClass('change-password-card'))
        .start().addClass('sub-heading').add('Change Password').end()
        .start().addClass(this.myClass('change-password-content'))
          .start().addClass('input-wrapper')
            .addClass(this.myClass('password-wrapper'))
            .start().add('Original Password').addClass('input-label').end()
            .start(this.ORIGINAL_PASSWORD).end()
          .end()
          .start().addClass('input-wrapper')
            .addClass(this.myClass('password-wrapper'))
            .start().add('New Password').addClass('input-label').end()
            .start(this.NEW_PASSWORD).end()
          .end()
          .start().addClass('input-wrapper')
            .addClass(this.myClass('password-wrapper'))
            .start().add('Confirm Password').addClass('input-label').end()
            .start(this.CONFIRM_PASSWORD).end()
          .end()
        .end()
        .start(this.UPDATE_PASSWORD)
          .addClass('sme').addClass('button').addClass('primary')
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'updatePassword',
      label: 'Update',
      code: function(X) {
        var self = this;

        // check if original password entered
        if ( ! this.originalPassword ) {
          this.add(this.NotificationMessage.create({ message: this.emptyOriginal, type: 'error' }));
          return;
        }

        // validate new password
        if ( ! this.newPassword ) {
          this.add(this.NotificationMessage.create({ message: this.emptyPassword, type: 'error' }));
          return;
        }

        if ( this.newPassword.includes(' ') ) {
          this.add(this.NotificationMessage.create({ message: this.noSpaces, type: 'error' }));
          return;
        }

        if ( this.newPassword.length < 7 || this.newPassword.length > 32 ) {
          this.add(this.NotificationMessage.create({ message: this.invalidLength, type: 'error' }));
          return;
        }

        if ( ! /\d/g.test(this.newPassword) ) {
          this.add(this.NotificationMessage.create({ message: this.noNumbers, type: 'error' }));
          return;
        }

        if ( /[^a-zA-Z0-9]/.test(this.newPassword) ) {
          this.add(this.NotificationMessage.create({ message: this.noSpecial, type: 'error' }));
          return;
        }

        // check if confirmation entered
        if ( ! this.confirmPassword ) {
          this.add(this.NotificationMessage.create({ message: this.emptyConfirmation, type: 'error' }));
          return;
        }

        // check if passwords match
        if ( ! this.confirmPassword.trim() || this.confirmPassword !== this.newPassword ) {
          this.add(this.NotificationMessage.create({ message: this.passwordMismatch, type: 'error' }));
          return;
        }

        // update password
        this.auth.updatePassword(null, this.originalPassword, this.newPassword).then(function(result) {
          // copy new user, clear password fields, show success
          self.user.copyFrom(result);
          self.originalPassword = null;
          self.newPassword = null;
          self.confirmPassword = null;
          self.add(self.NotificationMessage.create({ message: self.passwordSuccess }));
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    }
  ]
});
