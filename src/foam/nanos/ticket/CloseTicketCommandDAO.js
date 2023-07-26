/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'CloseTicketCommandDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'A dao decorator that implements close command',

  javaImports: [
    'foam.dao.DAO'
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
    if ( obj instanceof TicketCloseCommand ) {
      TicketCloseCommand ticketCloseCommand = (TicketCloseCommand) obj;
      Ticket ticket = ticketCloseCommand.findTicket(x);
      if ( ticket != null ) {
        ticket.setStatus("CLOSED");
        ticket.clearAssignedTo();

        ticket = (Ticket) ((DAO) x.get("localTicketDAO")).put(ticket);
      }
      
      return ticket;
    }

    return getDelegate().cmd_(x, obj);
      `
    },
  ]
});
