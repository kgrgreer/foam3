foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'PasswordChangeForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Password change form for onboarding',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus'
  ],

  imports: [
    'user',
    'userDAO',
    'stack',
    'auth'
  ],

  properties: [
    {
      name: 'originalPassword'
    },
    {
      name: 'newPassword'
    },
    {
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
    ^ .net-nanopay-ui-ActionView{
      width: 540px;
      height: 40px;
      background-color: #59a5d5;
      color: white;
      margin-top: 30px;
    }
  `,

  messages: [
    { name: 'noSpaces', message: 'Password cannot contain spaces' },
    { name: 'noNumbers', message: 'Password must have one numeric character' },
    { name: 'noSpecial', message: 'Password must not contain: !@#$%^&*()_+' },
    { name: 'emptyOriginal', message: 'Please enter your original password'},
    { name: 'emptyPassword', message: 'Please enter your new password' },
    { name: 'emptyConfirmation', message: 'Please re-enter your new password' },
    { name: 'invalidLength', message: 'Password must be 7-32 characters long' },
    { name: 'passwordMismatch', message: 'Passwords do not match' },
    { name: 'passwordSuccess', message: 'Password successfully updated' },
    { name: 'passwordDescription', message: 'Please change you password before you start using the nanopay platform.'}
  ],

  methods: [
    function initE(){
      this 
        .addClass(this.myClass())
        .start().addClass('status')
          .start('p').addClass('account-status').add('Account ID ' + this.user.id).end()
          .start().addClass('generic-status Invoice-Status-Paid').add('Active').end()
        .end()
        .start().addClass('line').end()
        .start().addClass('Container')
          .start('div').addClass('container-1')
            .start('p').add("Next Step - Change Your Password").end()
            .start('p').add(this.passwordDescription).addClass('description').end()
          .end()
          .start('div')
            .start('h2').add("Original Password").addClass('label').end()
            .start(this.ORIGINAL_PASSWORD).attrs({ 'type':'password' }).end()
            .start('h2').add("New Password").addClass('label').end()
            .start(this.NEW_PASSWORD).attrs({ 'type':'password' }).end()
            .start('h2').add("Confirm Password").addClass('label').end()
            .start(this.CONFIRM_PASSWORD).attrs({ 'type':'password' }).end()
          .end()
          .start(this.CHANGE_PASSWORD).addClass('update-BTN').end()
        .end()
    }
  ],

  actions: [
    {
      name: 'changePassword',
      code: function(){
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
          this.add(self.NotificationMessage.create({ message: this.noNumbers, type: 'error' }));
          return;
        }

        if ( /[^a-zA-Z0-9]/.test(this.newPassword) ) {
          this.add(self.NotificationMessage.create({ message: this.noSpecial, type: 'error' }));
          return;
        }

        // check if confirmation entered
        if ( ! this.confirmPassword ) {
          this.add(self.NotificationMessage.create({ message: this.emptyConfirmation, type: 'error' }));
          return;
        }

        // check if passwords match
        if ( ! this.confirmPassword.trim() || this.confirmPassword !== this.newPassword ) {
          this.add(self.NotificationMessage.create({ message: this.passwordMismatch, type: 'error' }));
          return;
        }

        this.user.createdPwd = true;
        this.userDAO.put(this.user).then(function (result) {
          self.auth.updatePassword(null, self.originalPassword, self.newPassword).then(function(a){
            self.add(self.NotificationMessage.create({ message: self.passwordSuccess }));
            this.window.location.hash = '';
            this.window.location.reload();
          }).catch(function(err){
            self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
          });
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: 'Sorry something went wrong.', type: 'error' }));
        });
      }
    }
  ]
});
