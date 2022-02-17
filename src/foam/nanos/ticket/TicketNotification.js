/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.ticket.Ticket',
      name: 'ticket'
    }
  ]
});
