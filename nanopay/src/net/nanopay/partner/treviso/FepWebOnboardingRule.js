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
  package: 'net.nanopay.partner.treviso',
  name: 'FepWebOnboardingRule',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `Onboards business to FEPWeb if onboarding ucj is passed.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.partner.treviso.TrevisoService',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Business business = (Business) obj;
            try {
              // We don't need an alarm here since we are only putting to DAO internally
              ((TrevisoService) x.get("trevisoService")).createFepWebClient(business.getId());
            } catch ( Throwable t ) {
              Logger logger = (Logger) x.get("logger");
              logger.warning("FepWeb Onboarding Failed", t);
            }
          }
        }, "Onboards business to FepWeb if onboarding ucj is passed.");
      `
    }
  ]
});
