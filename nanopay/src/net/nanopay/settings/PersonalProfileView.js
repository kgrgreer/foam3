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
  package: 'net.nanopay.settings',
  name: 'PersonalProfileView',
  extends: 'foam.u2.View',
  
  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'Settings / Personal View',

  imports: [
    'auth',
    'user',
    'stack',
    'userDAO',
    'twofactor',
    'notificationSettingDAO',
    'notify'
  ],

  exports: [ 'as data' ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.ui.ExpandContainer'
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
    ^ .flex-rsb {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    ^ .flex-csb {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    ^ h1{
      opacity: 0.6;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
    }
    ^ h2{
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
    }
    ^ input{
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 10px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .phoneNumber-Dropdown{
      width: 80px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-right: 10px;
    }
    ^ .gTextField {
      width: auto;
      display: inline-block;
    }
    ^ .gSubTextField {
      width: auto;
      display: inline-block;
      font-size: 11px;
    }
    ^ .gInputField{
      width: auto;
      height: 40px;
      display: inline-block;
    }
    ^ .blockInputField {
      width: auto;
      height: 40px;
      display: block;
    }
    ^ .update-BTN{
      width: 135px;
      height: 40px;
      border-radius: 2px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
      cursor: pointer;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
      background-color: /*%PRIMARY3%*/ #406dea;
      margin-top: 19px;
    }
    ^ .update-BTN:hover {
      opacity: 0.9;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
    }
    ^ .personalProfile-Text{
      width: 141px;
      height: 20px;
      margin-right: 644px;
    }
    ^ .disabled {
      color: lightgray;
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
    ^ .status-Text {
      width: 90px;
      height: 14px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      letter-spacing: 0.2px;
      text-align: left;
      display: inline-block;
      padding-bottom: 10px;
    }
    ^ .status-Text.disabled {
      color: #a4b3b8;
    }
    ^ .status-Text.enabled {
      color: #2cab70;
    }
    ^ .qr-code {
      width: 100px;
      height: 100px;
      padding-top: 20px;
    }
    ^ .tfa-desc-container {
      height: 175px;
      margin: 0 auto;
    }
    ^ .tfa-qr-code {
      width: 45%;
      float: left;
    }
    ^ .tfa-qr-code span {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .tfa-download {
      width: 45%;
      float: right;
    }
    ^ .tfa-download span {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .tfa-download a {
      height: 16px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #59a5d5;
      margin-top: 22px;
      display: inline-block;
    }
    ^ .tfa-enable-container,
      .tfa-disable-container {
      text-align: center;
    }
    ^ .property-twoFactorToken.foam-u2-TextField {
      width: 225px;
      height: 30px;
      margin-right: 20px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
    }
    ^ .foam-u2-ActionView-enableTwoFactor,
      .foam-u2-ActionView-disableTwoFactor {
      width: 108px;
      margin-top: 10px;
      height: 37px;
      border-radius: 2px;
      border: solid 1px #59a5d5;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'firstName',
      validateObj: function(firstName) {
        var hasOkLength = firstName.length >= 1 && firstName.length <= 70;

        if ( ! firstName || ! hasOkLength ) {
          return this.FORM_ERROR;
        }
      }
    },
    {
      class: 'String',
      name: 'lastName',
      validateObj: function(lastName) {
        var hasOkLength = lastName.length >= 1 && lastName.length <= 70;

        if ( ! lastName || ! hasOkLength ) {
          return this.FORM_ERROR;
        }
      }
    },
    {
      class: 'String',
      name: 'jobTitle',
      validateObj: function(jobTitle) {
        if ( ! jobTitle ) {
          return this.JOB_TITLE_EMPTY_ERROR;
        }

        if ( jobTitle.length > 35 ) {
          return this.JOB_TITLE_LENGTH_ERROR;
        }
      }
    },
    {
      class: 'String',
      name: 'email',
      validateObj: function(email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if ( ! emailRegex.test(email) ) {
          return this.EMAIL_ERROR;
        }
      }
    },
    {
      class: 'String',
      name: 'phone'
    },
    {
      class: 'String',
      name: 'mobile'
    },
    {
      //We'll have to account for user country code when internationalize.
      class: 'String',
      name: 'phoneCode',
      value: '+1'
    },
    {
      class: 'String',
      name: 'twoFactorQrCode'
    },
    {
      class: 'String',
      name: 'twoFactorToken'
    },
    {
      class: 'Boolean',
      name: 'inAppNotificationsEnabled',
      label: 'Enabled'
    },
    {
      class: 'Boolean',
      name: 'emailNotificationsEnabled',
      label: 'Enabled'
    },
    {
      class: 'Boolean',
      name: 'smsNotificationsEnabled',
      label: 'Enabled'
    }
  ],

  messages: [
    { name: 'NO_INFORMATION', message: 'Please fill out all necessary fields before proceeding' },
    { name: 'INVALID_PHONE', message: 'Phone Number is invalid' },
    { name: 'INVALID_MOBILE', message: 'Mobile Phone Number is invalid' },
    { name: 'INFORMATION_UPDATED', message: 'Information has been successfully changed' },
    { name: 'FORM_ERROR', message: 'Error while saving your changes. Please review your input and try again.' },
    { name: 'JOB_TITLE_EMPTY_ERROR', message: 'Job title can\'t be empty' },
    { name: 'JOB_TITLE_LENGTH_ERROR', message: 'Job title is too long' },
    { name: 'EMAIL_ERROR', message: 'Invalid email address' },
    { name: 'TWO_FACTOR_NO_TOKEN_ERROR', message: 'Please enter a verification token' },
    { name: 'TWO_FACTOR_ENABLE_SUCCESS', message: 'Two-factor authentication enabled' },
    { name: 'TWO_FACTOR_ENABLE_ERROR', message: 'Could not enable two-factor authentication. Please try again.' },
    { name: 'TWO_FACTOR_DISABLE_SUCCESS', message: 'Two-factor authentication disabled' },
    { name: 'TWO_FACTOR_DISABLE_ERROR', message: 'Could not disable two-factor authentication. Please try again.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var personalProfile = this.ExpandContainer.create({ title: 'Personal profile', link: '', linkView: '' });
      var changePasswordProfile = this.ExpandContainer.create({ title: 'Change Password', link: '', linkView: '' });
      var twoFactorProfile = this.ExpandContainer.create({ title: 'Two-Factor Authentication', link: '', linkView: '' });
      var notificationProfile = this.ExpandContainer.create({ title: 'Notifications', link: '', linkView: '' });

      if ( this.user.firstName != "" ) {
        this.firstName = this.user.firstName;
        this.lastName = this.user.lastName;
        this.jobTitle = this.user.jobTitle;
        this.email = this.user.email;
        // split the country code and phone number
        this.mobile = this.user.mobileNumber.replace(this.phoneCode, "");
        this.mobile = this.mobile.replace(/\s/g, "");
        this.phone = this.user.phoneNumber.replace(this.phoneCode, "");
        this.phone = this.phone.replace(/\s/g, "");
      }

      if ( this.user )
      {
        this.user.notificationSettings.where(this.CLASS_OF('foam.nanos.notification.NotificationSetting')).select().then(function (notificationSettingDAO) {
          var notificationSetting = notificationSettingDAO.array[0];
          self.inAppNotificationsEnabled = ( notificationSetting ) ? notificationSetting.enabled : true;
        });
          
        this.user.notificationSettings.where(this.CLASS_OF('foam.nanos.notification.EmailSetting')).select().then(function (notificationSettingDAO) {
          var emailSettings = notificationSettingDAO.array[0];
          self.emailNotificationsEnabled = ( emailSettings ) ? emailSettings.enabled : true;
        });

        this.user.notificationSettings.where(this.CLASS_OF('foam.nanos.notification.sms.SMSSetting')).select().then(function(notificationSettingDAO) {
          var smsSettings = notificationSettingDAO.array[0];
          self.smsNotificationsEnabled = ( smsSettings ) ? smsSettings.enabled: false;
        });
      }

      this
      .addClass(this.myClass())
      .start(personalProfile)
        .start().addClass('flex-rsb')
          .start().addClass('flex-csb')
            .start('h2').add("First name").addClass('gTextField').end()
            .start(this.FIRST_NAME).addClass('gInputField').end()
          .end()
          .start().addClass('flex-csb')
            .start('h2').add("Last name").addClass('gTextField').end()
            .start(this.LAST_NAME).addClass('gInputField').end()
          .end()
          .start().addClass('flex-csb')
            .start('h2').add("Job Title").addClass('gTextField').end()
            .start(this.JOB_TITLE).addClass('gInputField').end()
          .end()       
        .end()

        .start().addClass('flex-csb')
          .start('h2').add("Email Address").addClass('gTextField').end()
          .start(this.EMAIL).addClass('gInputField').end()
        .end()
        
        .start().addClass('flex-csb')
          .start('h2').add("Phone Number").addClass('gTextField').end()
          .start(this.PHONE).addClass('gInputField').end()
        .end()

        .start('div')
          .start({class: 'foam.u2.CheckBox'}, {mode: foam.u2.DisplayMode.DISABLED}).end()
          .add("Make my profile visible to public").addClass('checkBox-Text').addClass('disabled').end()
          .start(this.UPDATE_PROFILE).addClass('update-BTN').end()
        .end()
      .end();

      this
      .addClass(this.myClass())
      .start(notificationProfile)
        .start()
        .add(this.slot(function(inAppNotificationsEnabled) {
          return this.E()
            .start().addClass('flex-csb')
              .start('h2').add("In-App Notifications").addClass('gTextField').end()
              .start('div')
                .start(this.IN_APP_NOTIFICATIONS_ENABLED).end()
              .end()
              .callIf( ! inAppNotificationsEnabled, function() {
                this.start().add('Notifications will still show in your notification history for your records but will be marked as read automatically.').addClass('gSubTextField').end();
              })
            .end();
        }, this.inAppNotificationsEnabled$))
        .end()

        .start()
        .add(this.slot(function(emailNotificationsEnabled) {
          return this.E()
          .start().addClass('flex-csb')
            .start('h2').add("Email Notifications").addClass('gTextField').end()
            .start('div')
              .start(this.EMAIL_NOTIFICATIONS_ENABLED).end()
            .end()
          .end();
        }, this.emailNotificationsEnabled$))

        .start()
        .add(this.slot(function(smsNotificationsEnabled) {
          return this.E()
          .start().addClass('flex-csb')
            .start('h2').add("SMS Notifications").addClass('gTextField').end()
            .start('div')
              .start(this.SMS_NOTIFICATIONS_ENABLED).end()
              .start('div').show(this.smsNotificationsEnabled$)
                  .start('h2').add("Mobile Phone Number").addClass('gTextField').end()
                  .start(this.MOBILE).addClass('blockInputField').end()
              .end()
            .end()
          .end();
        }, this.smsNotificationsEnabled$))

        .start('div')
          .start(this.UPDATE_NOTIFICATIONS).addClass('update-BTN').end()
        .end()
      .end();

      this
      .addClass(this.myClass())
      .start(changePasswordProfile)
        .start().tag({
          class: foam.nanos.auth.ChangePasswordView,
          modelOf: 'foam.nanos.auth.UpdatePassword',
          showHeader: false,
          isHorizontal: true
        }).end()
      .end();

      this
      .addClass(this.myClass())
      .start(twoFactorProfile)
        .start()
          .addClass('status-Text')
          .addClass(this.user.twoFactorEnabled$.map(function(e) {
            return e ? 'enabled' : 'disabled';
          }))
          .add(this.user.twoFactorEnabled$.map(function(e) {
            return e ? 'Status: Enabled' : 'Status: Disabled';
          }))
        .end()
        .start()
          .add(this.slot(function(twoFactorEnabled) {
            if ( ! twoFactorEnabled ) {
              // two factor not enabled
              var self = this;
              this.twofactor.generateKeyAndQR(null)
                .then(function(otpKey) {
                  self.twoFactorQrCode = otpKey.qrCode;
                })
                .catch(function(err) {
                  self.notify(err.message, '', self.LogLevel.ERROR, true);
                });

              return this.E()
                .start('div').addClass('tfa-desc-container')
                  .start('div').addClass('tfa-qr-code')
                    .start('span')
                      .add('Open the authenticator app on your mobile device and scan the QR code to retrieve your verification code.')
                    .end()
                    .start('div').addClass('qr-code')
                      .start('img').attrs({ src: this.twoFactorQrCode$ }).end()
                    .end()
                  .end()
                  .start('div').addClass('tfa-download')
                    .start('span')
                      .add('Download the authenticator app on your mobile device if you do not already have it installed.')
                    .end()
                    .br()
                    .start('a').addClass('tfa-link')
                      .attrs({ href: 'https://itunes.apple.com/ca/app/google-authenticator/id388497605?mt=8' })
                      .add('iOS Device')
                    .end()
                    .br()
                    .start('a').addClass('tfa-link')
                      .attrs({ href: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en' })
                      .add('Android Device')
                    .end()
                    .br()
                    .start('a').addClass('tfa-link')
                      .attrs({ href: 'https://www.microsoft.com/en-ca/p/authenticator/9wzdncrfj3rj' })
                      .add('Windows Phone')
                    .end()
                  .end()
                .end()
                .start('div').addClass('tfa-enable-container')
                  .start('h2')
                    .add('Enter the validation code to enable Two-Factor Authentication.')
                  .end()
                  .br()
                  .start(this.TWO_FACTOR_TOKEN).end()
                  .start(this.ENABLE_TWO_FACTOR).end()
                .end()
            } else {
              return this.E()
                .start('div').addClass('tfa-enable-container')
                  .start('h2')
                    .add('Enter the validation code to disable Two-Factor Authentication.')
                  .end()
                  .br()
                  .start(this.TWO_FACTOR_TOKEN).end()
                  .start(this.DISABLE_TWO_FACTOR).end()
                .end()
            }
          }, this.user.twoFactorEnabled$))
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'updateNotifications',
      label: 'Update',
      code: function(X) {
        var self = this;

        this.user.notificationSettings
          .where(this.CLASS_OF('foam.nanos.notification.NotificationSetting')).select()
          .then(function (notificationSettingDAO) {
            var notificationSetting = notificationSettingDAO.array[0] ? notificationSettingDAO.array[0] : foam.nanos.notification.NotificationSetting.create({ owner: self.user.id });
            notificationSetting.enabled = self.inAppNotificationsEnabled;
            self.notificationSettingDAO.put(notificationSetting);
          });
          
        this.user.notificationSettings
          .where(this.CLASS_OF('foam.nanos.notification.EmailSetting')).select()
          .then(function (notificationSettingDAO) {
            var emailSetting = notificationSettingDAO.array[0] ? notificationSettingDAO.array[0] : foam.nanos.notification.EmailSetting.create({ owner: self.user.id });
            emailSetting.enabled = self.emailNotificationsEnabled;
            self.notificationSettingDAO.put(emailSetting);
          });

        this.user.notificationSettings
          .where(this.CLASS_OF('foam.nanos.notification.sms.SMSSetting')).select()
          .then(function(notificationSettingDAO) {
            var smsSetting = notificationSettingDAO.array[0] ? notificationSettingDAO.array[0] : foam.nanos.notification.sms.SMSSetting.create({ owner: self.user.id });
            smsSetting.enabled = self.smsNotificationsEnabled;
            if ( self.smsNotificationsEnabled ) {
              if ( ! /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(self.mobile) ) {
                self.notify(self.INVALID_MOBILE, '', self.LogLevel.ERROR, true);
                return;
              }
            }
            self.user.mobileNumber = self.phoneCode + self.mobile;
            self.userDAO.put(self.user).then((result) => {
              self.user.copyFrom(result);
            });
            self.notificationSettingDAO.put(smsSetting);
          });

        this.notify('Notification settings updated.', '', this.LogLevel.INFO, true);
      }
    },
    {
      name: 'updateProfile',
      label: 'Update',
      code: function (X) {
        var self = this;

        if ( ! this.firstName || ! this.lastName || ! this.jobTitle || ! this.email || ! this.phone ) {
          this.notify(this.NO_INFORMATION, '', this.LogLevel.ERROR, true);
          return;
        }

        if ( ! /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(this.phone) ) {
          this.notify(this.INVALID_PHONE, '', this.LogLevel.ERROR, true);
          return;
        }

        this.user.firstName = this.firstName;
        this.user.lastName = this.lastName;
        this.user.jobTitle = this.jobTitle;
        this.user.email = this.email;
        this.user.phoneNumber = this.phoneCode + this.phone;
        this.userDAO.put(this.user).then(function (result) {
          // copy new user, show success
          self.user.copyFrom(result);
          self.notify(self.INFORMATION_UPDATED, '', self.LogLevel.INFO, true);
        })
        .catch(function (err) {
          if ( err.exception && err.exception.userFeedback  ) {
            var currentFeedback = err.exception.userFeedback;
            while ( currentFeedback ) {
              self.notify(currentFeedback.message, '', self.LogLevel.ERROR, true);

              currentFeedback = currentFeedback.next;
            }
          } else {
            self.notify(err.message, '', self.LogLevel.ERROR, true);
          }
        });
      }
    },
    {
      name: 'enableTwoFactor',
      label: 'Enable',
      code: function (X) {
        var self = this;

        if ( ! this.twoFactorToken ) {
          this.notify(this.TWO_FACTOR_NO_TOKEN_ERROR, '', this.LogLevel.ERROR, true);
          return;
        }

        this.twofactor.verifyToken(null, this.twoFactorToken)
        .then(function (result) {
          if ( ! result ) {
            self.notify(self.TWO_FACTOR_ENABLE_ERROR, '', self.LogLevel.ERROR, true);
            return;
          }

          self.twoFactorToken = null;
          self.user.twoFactorEnabled = true;
          self.notify(self.TWO_FACTOR_ENABLE_SUCCESS, '', self.LogLevel.INFO, true);
        })
        .catch(function (err) {
          self.notify(self.TWO_FACTOR_ENABLE_ERROR, '', self.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'disableTwoFactor',
      label: 'Disable',
      code: function() {
        var self = this;

        if ( ! this.twoFactorToken ) {
          this.notify(this.TWO_FACTOR_NO_TOKEN_ERROR, '', this.LogLevel.ERROR, true);
          return;
        }

        this.twofactor.disable(null, this.twoFactorToken)
        .then(function(result) {
          if ( ! result ) {
            self.notify(self.TWO_FACTOR_DISABLE_ERROR, '', self.LogLevel.ERROR, true);
            return;
          }

          self.twoFactorToken = null;
          self.user.twoFactorEnabled = false;
          self.notify(self.TWO_FACTOR_DISABLE_SUCCESS, '', self.LogLevel.INFO, true);
        })
        .catch(function (err) {
          self.notify(self.TWO_FACTOR_DISABLE_ERROR, '', self.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
