/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


 foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'UCJDataExpiryRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: `Rule that set the expiry of ucj.`,

  javaImports: [
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  properties: [
    {
      class: 'Int',
      name: 'expiryPeriod',
      documentation: 'The number of time units to expire the ucj. Default to 1 year',
      value: 1
    },
    {
      documentation: 'Unit of expiredPeriod',
      name: 'expiryPeriodTimeUnit',
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      value: 'YEAR',
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
            var self = (UCJDataExpiryRule) rule;
            ucj.setExpiryPeriod(self.getExpiryPeriod());
            ucj.setExpiryPeriodTimeUnit(self.getExpiryPeriodTimeUnit());
            ucj.setExpiry(ucj.calculateDate(x, null, ucj.getExpiryPeriod(), ucj.getExpiryPeriodTimeUnit()));
            ruler.stop();
          `
        }
      ]
    }
  ]
});
