/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketHistoryRule',
  documentation: 'Adds an entry into the ticket history of a ticket',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'java.util.Date'
  ],


  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Ticket ticket = (Ticket) obj; 
        TicketHistory [] hOld = ticket.getTicketHistory();
        TicketHistory [] hNu = new TicketHistory[hOld.length + 1];
        System.arraycopy(hOld, 0, hNu, 0, hOld.length);
        TicketHistory hs = new TicketHistory();
        hs.setAssignedTo(ticket.getAssignedTo());
        hs.setAssignedFrom(hOld[hOld.length-1].getAssignedTo());
        hs.setTimeStamp(new Date());
        hNu[hNu.length-1] = hs;
        ticket.setTicketHistory(hNu);
      `
    }
  ]
});
