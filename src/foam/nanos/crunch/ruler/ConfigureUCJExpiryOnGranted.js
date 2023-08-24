/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'ConfigureUCJExpiryOnGranted',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.util.Calendar',
    'java.util.Date'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        final var clsName = getClass().getSimpleName();
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;

            Capability capability = (Capability) ucj.findTargetId(x);
            if ( capability == null ) {
              Loggers.logger(x, null, clsName).debug("Capability not found for target", ucj.getTargetId());
              return;
            }

            ucj.copyFromRenewable(x, capability);
            ucj.setExpiry(ucj.calculateDate(x, null, ucj.getExpiryPeriod(), ucj.getExpiryPeriodTimeUnit()));
          }
        }, "");
      `
    }
  ]
});
