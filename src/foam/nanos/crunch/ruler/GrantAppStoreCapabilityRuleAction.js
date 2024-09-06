/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'GrantAppStoreCapabilityRuleAction',

  documentation: 'Grant App Store capability when referralFee userCapabilityJunction created',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService'
  ],

  properties: [
    {
      class: 'String',
      name: 'capability'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            CrunchService crunchService = (CrunchService) x.get("crunchService");
            User user = ucj.findSourceId(x);

            crunchService.updateJunctionFor(x, getCapability(), null, CapabilityJunctionStatus.GRANTED, user, user);

          }
        }, "Grant AppStore capability when user get referral fee capability");
      `
    }
  ]
})
