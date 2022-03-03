/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

// Should this have a DAO of all notifs sent by this user using this model?
foam.CLASS({
  package: 'foam.nanos.notification.broadcast',
  name: 'BroadcastNotificationFacade',
  documentation: '',
  imports: [
    'notificationDAO',
    'ctrl'
  ],
  requires: [
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.broadcast.BroadcastNotification'
  ],
  messages: [
    { name: 'GROUP_REQUIRED', message: 'Group is required' },
    { name: 'BODY_REQUIRED', message: 'Notification body is required' },
    { name: 'TOAST_REQUIRED', message: 'Toast Message is required when showing toast' },
    { name: 'NOTIFICATION_SENT', message: 'Notification Sent' },
    { name: 'NOTIFICAITON_SUMMARY', message: 'notification to' }
  ],
  properties: [
    foam.nanos.notification.Notification.GROUP_ID.clone().copyFrom({
      label: 'Send To',
      validateObj: function(groupId) {
        if ( ! groupId ) {
          return this.GROUP_REQUIRED;
        }
      }
    }),
    foam.nanos.notification.Notification.BODY.clone().copyFrom({
      label: 'Notification Body',
      view: { class: 'foam.u2.view.RichTextView' },
      validateObj: function(body) {
        if ( ! body || ! body.length || ! body.trim() ) {
          return this.BODY_REQUIRED;
        }
      }
    }),
    {
      class: 'Boolean',
      name: 'showToast',
      postSet: function(_, n) { if ( ! n ) this.toastMessage = ''; }
    },
    foam.nanos.notification.Notification.TOAST_MESSAGE.clone().copyFrom({
      onKey: true,
      createVisibility: function(showToast) {
        return showToast ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validateObj: function(showToast, toastMessage) {
        if ( showToast && ( ! toastMessage.length || ! toastMessage.trim() ) ) {
          return this.TOAST_REQUIRED;
        }
      }
    })
  ],

  methods: [
    function toSummary() {
      return this.NOTIFICATION_SUMMARY + this.groupId;
    }
  ],

  actions: [
    {
      name: 'send',
      buttonStyle: 'PRIMARY',
      confirmationView: function() { return true; },
      isEnabled: function(errors_) {
        return ! errors_;
      },
      code: function() {
        var a = this.BroadcastNotification.create({
          body: this.body,
          toastMessage: this.toastMessage,
          groupId: this.groupId,
          severity: 'INFO',
          transient: false,
          toastState: this.showToast ? 'REQUESTED' : 'NONE'
        });
        this.notificationDAO.put(a).then(() => {
          // Reset all props
          this.body = undefined;
          this.toastMessage = undefined;
          this.showToast = undefined;
          this.groupId = undefined;
          this.ctrl.notify(this.NOTIFICATION_SENT, '', 'INFO', true);
        });
      }
    }
  ]
});
