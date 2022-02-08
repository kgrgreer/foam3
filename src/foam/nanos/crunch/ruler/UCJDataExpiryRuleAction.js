/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


 foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'UCJDataExpiryRuleAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.crunch.RenewableData',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.time.LocalDate',
    'java.time.ZoneId',
    'java.util.Date',
  ],

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
});
