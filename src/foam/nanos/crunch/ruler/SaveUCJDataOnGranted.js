/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'SaveUCJDataOnGranted',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Loggers'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        final var clsName = getClass().getSimpleName();
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;

            // NOTE: explicit test for GRANTED, as the same test on
            // the rule predicate fails some capability updates.
            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED ) {
              return;
            }

            if ( ucj.getData() == null ) {
              return;
            }

            UserCapabilityJunction old = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucj.getId());
            if ( old != null &&
                 old.getStatus() == CapabilityJunctionStatus.GRANTED &&
                 ! old.getIsInRenewable() &&
                 ucj.getData().equals(old.getData()) ) {
              return;
            }

            Capability capability = (Capability) ucj.findTargetId(x);
            if ( capability == null ) {
              Loggers.logger(x, this, clsName).warning("Target capability not found", ucj.getTargetId(), "ucj", ucj.getId());
              throw new RuntimeException("Capability not found, data not saved to target");
            }

            if ( capability.getOf() != null && capability.getDaoKey() != null ) {
              ucj.saveDataToDAO(x, capability, true);
            }
          }
        }, "");
      `
    }
  ]
});
