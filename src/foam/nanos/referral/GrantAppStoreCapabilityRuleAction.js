/**
 * NANOPAY CONFIDENTIAL
 *
 * [2024] nanopay Corporation
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
  package: 'foam.nanos.referral',
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

            crunchService.updateJunctionFor(x, "net.nanopay.partner.nbp.AppStore", null, CapabilityJunctionStatus.GRANTED, user, user);

          }
        }, "Grant AppStore capability when user get referral fee capability");
      `
    }
  ]
})
