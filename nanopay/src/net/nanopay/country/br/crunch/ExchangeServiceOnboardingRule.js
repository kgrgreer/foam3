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
  package: 'net.nanopay.country.br.crunch',
  name: 'ExchangeServiceOnboardingRule',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `Onboards business to Brazil Exchange Service if onboarding ucj is passed.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'net.nanopay.country.br.exchange.ExchangeService',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            User user = (User) ucj.findSourceId(x);
            if ( ! (user instanceof Business) ) return;

            try {
              ((ExchangeService) x.get("exchangeService")).createExchangeCustomerDefault(user.getId());
            } catch (Exception e) {
              String msg = "Error onboarding business  to exchange " + user.getId();
              ((Logger) x.get("logger")).error(msg, e);

              Notification notification = new Notification.Builder(x)
                .setTemplate("NOC")
                .setBody(msg + " " + e.getMessage())
                .build();
              ((DAO) x.get("localNotificationDAO")).put(notification);
              }
          }
        }, "Onboards business to Brazil Exchange Service if onboarding ucj is passed.");
      `
    }
  ]
});
