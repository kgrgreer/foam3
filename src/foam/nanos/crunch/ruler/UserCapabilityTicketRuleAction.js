/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'UserCapabilityTicketRuleAction',

  documentation: 'Grant Capability to User',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityTicket',
    'foam.nanos.crunch.CrunchService'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityTicket ticket = (UserCapabilityTicket) obj;
            CrunchService crunchService = (CrunchService) x.get("crunchService");
            DAO dao = (DAO) x.get("userDAO");

            for ( var id : ticket.getCreatedForUsers() ) {
              User user = (User) dao.find(id);
              crunchService.updateJunctionFor(x, ticket.getCapability(), null, CapabilityJunctionStatus.GRANTED, user, user);
            }

            ticket.setStatus("CLOSED");
          }
        }, "UserCapabilityTicketRuleAction");
      `
    }
  ]
})
