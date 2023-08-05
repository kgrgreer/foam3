/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


 foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'UCJDataExpiryRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: `Rule that set the expiry of ucj renewable data.`,

  javaImports: [
    'foam.nanos.crunch.RenewableData',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  properties: [
    {
      class: 'Int',
      name: 'expiredIn',
      documentation: 'The number of time units to expire the ucj. Default to 365 days (1 year)',
      value: 365
    },
    {
      documentation: 'Unit of expiredIn',
      name: 'expiryPeriodTimeUnit',
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      value: 'DAY',
    },
    {
      name: 'daoKey',
      value: 'userCapabilityJunctionDAO'
    },
    {
      name: 'after',
      value: false
    },
    {
      name: 'action',
      transient: true,
      javaFactory: 'return new UCJDataExpiryRuleAction();'
    },
    {
      name: 'asyncAction',
      transient: true,
      javaGetter: 'return null;'
    }
  ],

  classes: [
    {
      name: 'UCJDataExpiryRuleAction',
      implements: [ 'foam.nanos.ruler.RuleAction' ],
      methods: [
        {
          name: 'applyAction',
          javaCode: `
            var ucj = (UserCapabilityJunction) obj;
            var cap = ucj.findCapability(x);
            UCJDataExpiryRule self = (UCJDataExpiryRule) rule;
            ((RenewableData) ucj.getData())
              .setExpiry(cap.calculateDate(x, null, self.getExpiredIn(), self.getExpiryPeriodTimeUnit()));
            ruler.stop();
          `
        }
      ]
    }
  ]
});
