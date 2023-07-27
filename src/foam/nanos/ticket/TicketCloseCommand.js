/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketCloseCommand',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Ticket Close Command. Pass this class instance to ticketDAO.cmd to close a ticket

    e.g., 
      ticketDAO.cmd_(x, new TicketCloseCommand.Builder(x).setTicket(<ticket id>).build());
    `,

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.ticket.Ticket',
      name: 'ticket'
    }
  ]
});
