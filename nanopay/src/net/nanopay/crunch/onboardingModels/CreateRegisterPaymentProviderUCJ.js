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
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
            String capId = "554af38a-8225-87c8-dfdf-eeb15f71215f-20";
            UserCapabilityJunction ucj = (UserCapabilityJunction) ucjDAO.find(AND(
              EQ(UserCapabilityJunction.TARGET_ID, capId),
              EQ(UserCapabilityJunction.SOURCE_ID, ((UserCapabilityJunction) obj).getSourceId())
            ));

            if ( ucj == null ) {
              ucj = new UserCapabilityJunction.Builder(x).setSourceId(((UserCapabilityJunction) obj).getSourceId())
                .setTargetId(capId)
                .setStatus(CapabilityJunctionStatus.PENDING_REVIEW)
                .build();
              ucjDAO.put_(x, ucj);
            }
          }
        }, "Create ucj on user passed compliance");
      `
    }
  ]
});
