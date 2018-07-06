 foam.CLASS({
  package: 'net.nanopay.settings',
  name: 'PersonalProfileView',
  extends: 'foam.u2.View',

  documentation: 'Settings / Personal View',

  imports: [
    'auth',
    'user',
    'stack',
    'userDAO'
  ],

  exports: [ 'as data' ],

  requires: [
    'net.nanopay.ui.ExpandContainer',
    'foam.u2.dialog.NotificationMessage'
  ],

  css:`
    ^{
      width: 1280px;
      margin: auto;
    }
    ^ .Container{
      width: 960px;
      padding-bottom: 13px;
      border-radius: 2px;
      background-color: #ffffff;
      margin-top: 50px;
      margin-left: 160px;
    }
    ^ .net-nanopay-ui-ExpandContainer{
      width: 1000px;
      margin-top: 30px;
    }
    ^ .firstName-Text{
      margin-right: 88px;
      margin-bottom: 8px;
    }
    ^ .lastName-Text{
      margin-right: 82px;
      margin-bottom: 8px;
    }
    ^ .jobTitle-Text{
      margin-bottom: 8px;
    }
    ^ h1{
      opacity: 0.6;
      font-family: Roboto;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
      display: inline-block;
    }
    ^ h2{
      width: 150px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      display: inline-block;
    }
    ^ input{
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 10px;
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2;
      text-align: left;
      color: #093649;
    }
    ^ .firstName-Input{
      width: 215px;
      height: 40px;
      margin-right: 20px;
      margin-bottom: 20px;
    }
    ^ .lastName-Input{
      width: 215px;
      height: 40px;
      margin-right: 20px;
    }
    ^ .jobTitle-Input{
      width: 470px;
      height: 40px;
    }
    ^ .emailAddress-Text{
      margin-bottom: 8px;
      margin-right: 322px;
    }
    ^ .phoneNumber-Dropdown{
      width: 80px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-right: 10px;
    }
    ^ .emailAddress-Input{
      width: 450px;
      height: 40px;
      margin-right: 20px;
      margin-bottom: 19px;
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      padding: 10px ;
      color: #a4b3b8 !important;
    }
    ^ .phoneNumber-Input{
      width: 380px;
      height: 40px;
    }
   
    ^ .update-BTN{
      width: 135px;
      height: 40px;
      border-radius: 2px;
      font-family: Roboto;
      font-size: 14px;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
      cursor: pointer;
      border: 1px solid %SECONDARYCOLOR%;
      background-color: %SECONDARYCOLOR%;
      margin-top: 19px;
    }
    ^ .update-BTN:hover {
      opacity: 0.9;
      border: 1px solid %SECONDARYCOLOR%;
    }
    ^ .check-Box{
      border: solid 1px rgba(164, 179, 184, 0.5);
      width: 14px;
      height: 14px;
      border-radius: 2px;
      margin-right: 20px;
      position: relative;
    }
    ^ .foam-u2-CheckBox{
      padding-bottom: 11px;
      display: inline-block;
    }
    ^ .checkBox-Text{
      height: 16px;
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      display: block;
      margin-bottom: 11px;
    }
    ^ .status-Text{
      width: 90px;
      height: 14px;
      font-family: Roboto;
      font-size: 12px;
      letter-spacing: 0.2px;
      text-align: left;
      color: #a4b3b8;
      margin-right: 770px;
      display: inline-block;
    }
    ^ .personalProfile-Text{
      width: 141px;
      height: 20px;
      margin-right: 644px;
    }
    ^ .toggleDiv {
      position: relative;
      display: inline-block;
      top: -5;
    }

    ^ .disabled {
      color: lightgray;
    }
    ^ .originalPass-Text{
      width: 118px;
      height: 16px;
      margin-bottom: 8px;
      margin-right: 205px;
    }
    ^ .newPass-Text{
      width: 118px;
      height: 16px;
      margin-right: 205px;
    }
    ^ .confirmPass-Text{
      width: 119px;
      height: 16px;
    }
    ^ .originalPass-Input{
      width: 303px;
      height: 40px;
      margin-right: 20px;
    }
    ^ .newPass-Input{
      width: 303px;
      height: 40px;
      margin-right: 20px;
    }
    ^ .confirmPass-Input{
      width: 303px;
      height: 40px;
    }
    ^ .changePass-Text{
      width: 164px;
      height: 20px;
      margin-right: 621px;
    }
    ^ .twoFactorDiv {
      display: inline-block;
      width: 855px;
    }
    ^ .toggleDiv {
      position: relative;
      display: inline-block;
      top: -5;
    }
    ^ .tfa-Container{
      width: 1000px;
      height: 80px;
      border-radius: 2px;
      background-color: #ffffff;
      margin-left: 140px;
      margin-top: 30px;
    }
    ^ .tfa-Text{
      width: 211px;
      height: 20px;
      margin-left: 20px;
    }
    ^ .status-Text{
      width: 90px;
      height: 14px;
      font-family: Roboto;
      font-size: 12px;
      letter-spacing: 0.2px;
      text-align: left;
      color: #a4b3b8;
      margin-left: 20px;    
      margin-right: 770px;
      display: inline-block;
    }
    ^ .net-nanopay-ui-ToggleSwitch-toggleswitch {
      width: 60px;
      margin-left: 65px;
    }
    ^ .net-nanopay-ui-ToggleSwitch-inner:before, 
    ^ .net-nanopay-ui-ToggleSwitch-inner:after {
      height: 30px;
    }
    ^ .net-nanopay-ui-ToggleSwitch-switch {
      width: 22px;
      right: 26px;
    }
    ^ .emailPref-Text{
      width: 185px;
      height: 20px;
      margin-left: 20px;
      margin-right: 600px;
    }
    ^ .unsubscribe-Text{
      margin-top: 30px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'firstName',
      validateObj: function(firstName) {
        var hasOkLength = firstName.length >= 1 && firstName.length <= 70;

        if ( ! firstName || ! hasOkLength ) {
          return this.FormError;
        }
      }
    },
    {
      class: 'String',
      name: 'lastName',
      validateObj: function(lastName) {
        var hasOkLength = lastName.length >= 1 && lastName.length <= 70;

        if ( ! lastName || ! hasOkLength ) {
          return this.FormError;
        }
      }
    },
    {
      class: 'String',
      name: 'jobTitle',
      validateObj: function(jobTitle) {
        if ( ! jobTitle ) {
          return this.JobTitleEmptyError;
        }

        if ( jobTitle.length > 35 ) {
          return this.JobTitleLengthError;
        }
      }
    },
    {
      class: 'String',
      name: 'email',
      validateObj: function(email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if ( ! emailRegex.test(email) ) {
          return this.EmailError;
        }
      }
    },
    {
      class: 'String',
      name: 'phone'
    },
    { 
      //We'll have to account for user country code when internationalize.
      class: 'String',
      name: 'phoneCode',
      value: '+1'
    },
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
    },
    {
      class: 'Boolean',
      name: 'twoFactorEnabled',
      value: false
    }
  ],
  messages: [
    { name: 'noSpaces', message: 'Password cannot contain spaces' },
    { name: 'noNumbers', message: 'Password must have one numeric character' },
    { name: 'noSpecial', message: 'Password must not contain: !@#$%^&*()_+' },
    { name: 'emptyOriginal', message: 'Please enter your original password'},
    { name: 'emptyPassword', message: 'Please enter your new password' },
    { name: 'emptyConfirmation', message: 'Please re-enter your new password' },
    { name: 'invalidLength', message: 'Password must be 7-32 characters long' },
    { name: 'passwordMismatch', message: 'Passwords do not match' },
    { name: 'passwordSuccess', message: 'Password successfully updated' }
  ],
  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      var personalProfile = this.ExpandContainer.create({ title: 'Personal profile', link: '', linkView: '' });
      var resetPasswordProfile = this.ExpandContainer.create({ title: 'Reset Password', link: '', linkView: '' });
      var emailPreferenceProfile = this.ExpandContainer.create({ title: 'Email Preferences', link: '', linkView: '' });
      var notificationPreferenceProfile = this.ExpandContainer.create({ title: 'Notification Preferences', link: '', linkView: '' });
      
      if (this.user.firstName != "")
      {
        this.firstName = this.user.firstName;
        this.lastName = this.user.lastName;
        this.jobTitle = this.user.jobTitle;
        this.email = this.user.email;
        // split the country code and phone number
        this.phone = this.user.phone.number.replace(this.phoneCode, "");
        this.phone = this.phone.replace(/\s/g, "");
      }
      this
      .addClass(this.myClass())
      .start(personalProfile)
        .start()
          .start('div')
            .start('h2').add("First name").addClass('firstName-Text').end()
            .start('h2').add("Last name").addClass('lastName-Text').end()
            .start('h2').add("Job Title").addClass('jobTitle-Text').end()
          .end()
          .start('div')
            .start(this.FIRST_NAME).addClass('firstName-Input').end()
            .start(this.LAST_NAME).addClass('lastName-Input').end()
            .start(this.JOB_TITLE).addClass('jobTitle-Input').end()
          .end()
          .start('div')
            .start('h2').add("Email Address").addClass('emailAddress-Text').end()
            .start('h2').add("Phone Number").end()
          .end()
          .start('div')
            .start(this.EMAIL ,{ mode:  this.email ? foam.u2.DisplayMode.RO : foam.u2.DisplayMode.RW}).addClass('emailAddress-Input').end()
            .start(this.PHONE_CODE, {mode: foam.u2.DisplayMode.DISABLED}).addClass('phoneNumber-Dropdown').end()
            .start(this.PHONE).addClass('phoneNumber-Input').end()
          .end()
          .start('div')
            .start({class: 'foam.u2.CheckBox'}, {mode: foam.u2.DisplayMode.DISABLED}).end()
            .add("Make my profile visible to public").addClass('checkBox-Text').addClass('disabled').end()
            .start(this.UPDATE_PROFILE).addClass('update-BTN').end()
          .end()
        .end()
      .end()
      this
      .addClass(this.myClass())
        .start(resetPasswordProfile)
          .start('div')
            .start('h2').add("Original Password").addClass('originalPass-Text').end()
            .start('h2').add("New Password").addClass('newPass-Text').end()
            .start('h2').add("Confirm Password").addClass('confirmPass-Text').end()
          .end()
          .start('div')
            .start(this.ORIGINAL_PASSWORD).addClass('originalPass-Input').end()
            .start(this.NEW_PASSWORD).addClass('newPass-Input').end()
            .start(this.CONFIRM_PASSWORD).addClass('confirmPass-Input').end()
          .end()
          .start(this.UPDATE_PASSWORD).addClass('update-BTN').end()
        .end()
      .end()
      this
      .addClass(this.myClass())
      .start()
        .start().addClass('tfa-Container')
          .start('div').addClass('twoFactorDiv')
            .start('h1').add("2 Factor Authentication").addClass('tfa-Text').end()
            .start().add(this.twoFactorEnabled$.map(function(e) { return e ? 'Status: Enabled' : 'Status: Disabled' })).addClass('status-Text').end()
          .end()
          .start('div').addClass('toggleDiv')
            .tag({ class: 'net.nanopay.ui.ToggleSwitch', data$: this.twoFactorEnabled$ })
          .end()
        .end()
      .end()
      this
      .addClass(this.myClass())
      .start(emailPreferenceProfile)
        .start('div').addClass('checkbox-Div')
          .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When an invoice is first seen by the other party").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When an invoice or bill requires approval").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When an invoice or bill is overdue").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("New Features and updates").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("Unsubscribe all").addClass('unsubscribe-Text').addClass('checkBox-Text')
        .end()
        .start('div')
          .start(this.UPDATE_EMAIL_PREFERENCE).addClass('update-BTN').end()
        .end()
      .end()
      this
      .addClass(this.myClass())
      .start(notificationPreferenceProfile)
        .start('div').addClass('checkbox-Div')
          .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When an invoice is first seen by the other party").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When an invoice or bill requires approval").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("When an invoice or bill is overdue").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("New Features and updates").addClass('checkBox-Text')
        .end()
        .start('div')
          .tag({class: 'foam.u2.CheckBox'}).add("Unsubscribe all").addClass('unsubscribe-Text').addClass('checkBox-Text')
        .end()
        .start('div')
          .start(this.UPDATE_NOTIFICATION_PREFERENCE).addClass('update-BTN').end()
        .end()
      .end()
    .end()
    }
  ],

  messages: [
    { name: 'noInformation', message: 'Please fill out all necessary fields before proceeding.' },
    { name: 'invalidPhone', message: 'Phone number is invalid.' },
    { name: 'informationUpdated', message: 'Information has been successfully changed.' },
    { name: 'FormError', message: 'Error while saving your changes. Please review your input and try again.' },
    { name: 'JobTitleEmptyError', message: 'Job title can\'t be empty' },
    { name: 'JobTitleLengthError', message: 'Job title is too long' },
    { name: 'EmailError', message: 'Invalid email address' },  
    { name: 'noSpaces', message: 'Password cannot contain spaces' },
    { name: 'noNumbers', message: 'Password must have one numeric character' },
    { name: 'noSpecial', message: 'Password must not contain: !@#$%^&*()_+' },
    { name: 'emptyOriginal', message: 'Please enter your original password'},
    { name: 'emptyPassword', message: 'Please enter your new password' },
    { name: 'emptyConfirmation', message: 'Please re-enter your new password' },
    { name: 'invalidLength', message: 'Password must be 7-32 characters long' },
    { name: 'passwordMismatch', message: 'Passwords do not match' },
    { name: 'passwordSuccess', message: 'Password successfully updated' }
  ],

  actions: [
    {
      name: 'updateProfile',
      label: 'Update',
      code: function (X) {
        var self = this;

        if ( ! this.firstName || ! this.lastName || ! this.jobTitle || ! this.email || ! this.phone ) {
          this.add(this.NotificationMessage.create({ message: this.noInformation, type: 'error' }));
          return;
        }

        if ( ! /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(this.phone) ) {
          this.add(self.NotificationMessage.create({ message: this.invalidPhone, type: 'error' }));
          return;
        }

        this.user.firstName = this.firstName;
        this.user.lastName = this.lastName;
        this.user.jobTitle = this.jobTitle;
        this.user.email = this.email;
        this.user.phone.number = this.phoneCode + " " + this.phone;
        this.userDAO.put(this.user).then(function (result) {
          // copy new user, clear password fields, show success
          self.user.copyFrom(result);
          self.add(self.NotificationMessage.create({ message: self.informationUpdated }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
    {
      name: 'updatePassword',
      label: 'Update',
      code: function (X) {
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

        // update password
        this.auth.updatePassword(null, this.originalPassword, this.newPassword).then(function (result) {
          // copy new user, clear password fields, show success
          self.user.copyFrom(result);
          self.originalPassword = null;
          self.newPassword = null;
          self.confirmPassword = null;
          self.add(self.NotificationMessage.create({ message: self.passwordSuccess }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
    {
      name: 'updateEmailPreference',
      label: 'Update',
      code: function (X) {
        var self = this;
        console.log("UPDATE EMAILS PREFERENCE")
      }
    },
    {
      name: 'updateNotificationPreference',
      label: 'Update',
      code: function (X) {
        var self = this;
        console.log("UPDATE NOTIFICATION PREFERENCE")
      }
    }
  ]
});
