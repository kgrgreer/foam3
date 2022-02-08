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

  properties: [
    {
      class: 'Int',
      name: 'expiredIn',
      documentation: 'The number of days to expire the ucj. Default to 365 days (1 year)',
      value: 365
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
  ]
});
