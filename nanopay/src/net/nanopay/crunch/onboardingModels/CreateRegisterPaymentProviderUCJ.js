/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'CreateRegisterPaymentProviderUCJ',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Create a UserCapabilityJunction between User and Register Payment provider capability on compliance passed',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction'
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

            String capId = "554af38a-8225-87c8-dfdf-eeb15f71215f-20";

            crunchService.updateUserJunction(x, ucj.getSubject(x), capId, null, CapabilityJunctionStatus.PENDING);
          }
        }, "Create ucj on user passed compliance");
      `
    }
  ]
});
