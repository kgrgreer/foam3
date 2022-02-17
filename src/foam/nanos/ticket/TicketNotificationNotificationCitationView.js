/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketNotificationNotificationCitationView',
  extends: 'foam.nanos.notification.NotificationCitationView',

  imports: [
    'stack',
    'ticketDAO'
  ],

  requires: [
    'foam.comics.v2.DAOControllerConfig',
    'foam.u2.stack.StackBlock'
  ],

  css: `
    ^link {
      margin-top: 8px;
      margin-left: 32px;
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.ticket.Ticket',
      name: 'ticket',
      hidden: true,
      transient: true
    },
    {
      class: 'Boolean',
      name: 'hasFoundTicket',
      documentation: 'Check if ticket id attached to the notification (data.ticket) is valid',
      transient: true,
      hidden: true
    },
    {
      name: 'data',
      postSet: function() {
        if ( ! this.data.ticket ) {
          this.hasFoundTicket = false;
          return;
        }

        this.ticketDAO.find(this.data.ticket).then(ticket => {
          this.hasFoundTicket = !! ticket;
          this.ticket = this.hasFoundTicket ? ticket : undefined;
        });
      }
    }
  ],

  methods: [
    function render() {
      const self = this;
      this.SUPER();
      this
        .start().addClass(this.myClass('link'))
          .startContext({ data: this })
            .show(this.hasFoundTicket$)
            .tag(this.GO_TO_TICKET, { buttonStyle: 'PRIMARY', size: 'SMALL' })
          .endContext() 
        .end();
    }
  ],
  actions: [
    {
      name: 'goToTicket',
      label: 'Go to the ticket',
      code: async function() {

        if ( ! this.ticket ) return;

        this.stack.push(this.StackBlock.create({
          view: {
            class: 'foam.comics.v2.DAOSummaryView',
            data: this.ticket,
            of: this.ticket.cls_,
            config: this.DAOControllerConfig.create({
              daoKey: 'ticketDAO',
              of: this.ticket.cls_,
              editPredicate: foam.mlang.predicate.False.create(),
              createPredicate: foam.mlang.predicate.False.create(),
              deletePredicate: foam.mlang.predicate.False.create()
            })
          },
          parent: this.__subContext__
        }));
      }
    }
  ]
});
