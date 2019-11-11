/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.ticket',
  name: 'TicketDAOCreateView',
  extends: 'foam.comics.v2.DAOCreateView',

  requires: [
    'foam.nanos.ticket.Ticket',
    'foam.u2.dialog.NotificationMessage'
  ],
  
  documentation: `
    A configurable view to create an instance of a specified ticket
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return {
          class: 'foam.u2.view.FObjectView',
          choices: [
              ['foam.nanos.ticket.Ticket', 'Default'],
              ['net.nanopay.ticket.SudoTicket', 'Sudo']
          ],
        };
      }
    },
    {
      name: 'data',
      preSet: function(_, n) {
        if ( n.cls_ === foam.nanos.ticket.Ticket ) return this.Ticket.create();
        return n;
      }      
    }
  ],

  actions: [
    {
      name: 'save',
      code: function() {
        this.data.owner = this.__subContext__.user.id;
        this.config.dao.put(this.data).then(o => {
          this.data = o;
          this.finished.pub();
          this.stack.back();
        }, e => {
          this.throwError.pub(e);
          this.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    },
  ],
});
