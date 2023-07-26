/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketDAOCommand',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'A class that holds a ticket and a ticket dao command',

  constants: [
    {
      name: 'CLOSE_CMD',
      type: 'String',
      value: 'CLOSE_CMD',
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'cmd'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.ticket.Ticket',
      name: 'ticket'
    }
  ]
});
