/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.notification.broadcast',
  name: 'BroadcastNotificationNotificationCitationView',
  extends: 'foam.nanos.notification.NotificationCitationView',

  requires: ['foam.u2.HTMLView'],
  methods: [
    function render() {
      this
      .addClass(this.myClass())
      .start().addClass(this.myClass('created'))
        .add(this.created$)
      .end()
      .start(this.HTMLView, { data$: this.description$ }).addClasses(['p', this.myClass('description')])
      .end();
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.notification.broadcast',
  name: 'BroadcastNotificationNotificationMessageModal',
  extends: 'foam.nanos.notification.NotificationMessageModal',

  requires: ['foam.u2.HTMLView'],
  methods: [
    function render() {
      this
      .addClass(this.myClass())
      .start(this.Rows)
        .addClass(this.myClass('container'))
        .start().addClass('p-bold').add(this.CREATED_MSG).end()
        .start().add(this.created$).end()
      .end()
      .start(this.Rows)
        .addClass(this.myClass('container'))
        .start().addClass('p-bold').add(this.MESSAGE_MSG).end()
        .start(this.HTMLView, { data$: this.data.body$ }).addClass(this.myClass('message')).end()
      .end();
    }
  ]
});
