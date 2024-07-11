/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'EmailSettingNotificationSettingCitationView',
  extends: 'foam.nanos.notification.NotificationSettingCitationView',

  messages: [
    { name: 'EMAIL_MESSAGE', message: 'Emails are being sent to: '}
  ],

  methods: [
    function addContent() {
      let self = this;
      this.start()
        .addClass('p', this.myClass('column'))
        .start().addClass('p-semiBold').add(this.label).end()
        .add(this.slot(function(subject$user) {
          return this.E().add(self.EMAIL_MESSAGE).add(subject$user.email);
        }))
      .end();
    }
  ]
});
