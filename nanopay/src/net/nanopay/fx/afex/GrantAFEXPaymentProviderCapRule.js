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
  package: 'net.nanopay.fx.afex',
  name: 'GrantAFEXPaymentProviderCapRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Auto grant AFEX Payment Provider Capability after Afex business is created .`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'net.nanopay.model.Business',
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
          var crunchService = (CrunchService) x.get("crunchService");
          Logger logger = (Logger) x.get("logger");

          AFEXUser afexUser = (AFEXUser) obj;
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
          Business business = (Business) localBusinessDAO.find(EQ(Business.ID, afexUser.getUser()));
          if ( null != business ) {
            var subject = new Subject(x);
            subject.setUser(business);
            var subjectX = x.put("subject", subject);
            String afexPaymentMenuCapId = "AFEX";
            crunchService.updateJunction(subjectX, afexPaymentMenuCapId, null, CapabilityJunctionStatus.GRANTED);
          }
        }

      }, "Auto grant AFEX Payment Provider Capability after Afex business is created.");
      `
    }
  ]

});
