/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.notification.broadcast',
  name: 'SendNotificationView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.notification.broadcast.BroadcastNotificationFacade',
    'foam.nanos.notification.NotificationRowView',
    'foam.nanos.notification.broadcast.BroadcastNotification',
    'foam.u2.stack.BreadcrumbView',
    'foam.u2.layout.Rows',
    'foam.u2.borders.CardBorder',
    'foam.u2.detail.VerticalDetailView'
  ],
  imports: [
    'notificationDAO'
  ],

  documentation: '',
  // Make an abstract SummaryView with this CSS and props for title and primary action,
  // everything else can be populated by the parent view, maybe a border??
  css: `
    ^ {
      padding: 32px;
    }
    ^container > * + * {
      margin-top: 32px;
    }
    ^button {
      align-self: flex-end;
    }
  `,

  properties: [
    {
      name: 'data',
      factory: function() {
        return this.BroadcastNotificationFacade.create();
      }
    }
  ],
  methods: [
    function render() {
      var self = this;
      this.data.created = new Date();
      this
      .addClass()
      .start(this.Rows)
        .addClass(this.myClass('container'))
        .start()
          .add('Send Notification')
          .addClass('h100')
        .end()
        .start(self.CardBorder)
          .addClass(self.myClass('sectionWrapper'))
          .tag(this.VerticalDetailView, { data$: this.data$ })
          .start().add('Preview').addClass('p-semiBold').end()
          .start(this.NotificationRowView, { data$: this.data$, of: this.BroadcastNotification.id })
            .addClass(self.myClass('button'))
          .end()
        .end()
      .end();
    }
  ]
});

