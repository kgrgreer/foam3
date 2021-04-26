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
  package: 'net.nanopay.partner.rbc',
  name: 'RBCPaymentProviderCapabilityRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Grants RBC Payable Menu Capability after domestic onboarding is complete..`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          if ( ! ( obj  instanceof UserCapabilityJunction ) ) return;

          var crunchService = (CrunchService) x.get("crunchService");
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
          Business business = (Business) localBusinessDAO.find(((UserCapabilityJunction) obj).getSourceId());
          var subject = new Subject(x);
          subject.setUser(business);
          var subjectX = x.put("subject", subject);
          String rbcPaymentMenuCapId = "RBC";
          crunchService.updateJunction(subjectX, rbcPaymentMenuCapId, null, CapabilityJunctionStatus.GRANTED);
        }

      }, "Grants RBC Payable Menu Capability after domestic onboarding is complete..");
      `
    }
  ]

});
