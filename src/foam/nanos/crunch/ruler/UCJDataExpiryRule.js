/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

 foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'UCJDataExpiryRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: `Rule that set the expiry of ucj renewable data, based on some predicate.`,

  javaImports: [
    'foam.nanos.crunch.RenewableData',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.time.LocalDate',
    'java.time.ZoneId',
    'java.util.Date',
  ],

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
            ((RenewableData) ucj.getData())
              .setExpiry(Date.from(LocalDate.now()
                .plusDays(((UCJDataExpiryRule) rule).getExpiredIn())
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant()
              ));
            ruler.stop();
          `
        }
      ]
    }
  ]
});
