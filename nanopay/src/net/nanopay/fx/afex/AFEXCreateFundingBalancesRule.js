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
  name: 'AFEXCreateFundingBalancesRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to create funding balances when AFEXBusiness is active.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {

          AFEXBusiness business = (AFEXBusiness) obj;
          Logger logger = (Logger) x.get("logger");
          AFEXServiceProvider afexService = (AFEXServiceProvider) x.get("afexServiceProvider");
          try {
              afexService.createFundingBalance(x, business.getUser(), "USD");
          } catch (Throwable t) {
            String msg = "Error creating Funding balances for AFEX Business id: " + business.getId();
            logger.error(msg, t);
            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setBody(msg + " " + t.getMessage())
              .build();
              ((DAO) x.get("localNotificationDAO")).put(notification);
          }
        }
      }, "Rule to create funding balances when AFEXBusiness is active");
      `
    }
  ]

});
