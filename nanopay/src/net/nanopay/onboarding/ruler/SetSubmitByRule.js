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
  package: 'net.nanopay.onboarding.ruler',
  name: 'SetSubmitByRule',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `Set submitBy capability when unlock Domestic Payments and Invoicing goes from available, action required to pending.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.onboarding.model.BusinessOnboardingExtra',
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          X systemX = ruler.getX();
          @Override
          public void execute(X x) {
            DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            BusinessOnboardingExtra data = new BusinessOnboardingExtra.Builder(x).setSubmitBy(ucj.getSourceId()).build();
            UserCapabilityJunction submitByUcj = new 
                      UserCapabilityJunction.Builder(x)
                        .setSourceId(ucj.getSourceId())
                        .setTargetId("7bf54e2d-2bf0-41fe-bc25-31c8de030ffa")
                        .setData(data)
                        .setStatus(CapabilityJunctionStatus.GRANTED)
                        .build();
            ucjDAO.put(submitByUcj);
          }
        }, "Set SubmitBy to indicate the user who submit the onboarding information");
      `
    }
  ]
});
