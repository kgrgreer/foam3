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
    package: 'net.nanopay.invoice.ruler',
    name: 'RequestPaymentNotificationRule',

    documentation: `A rule that sends a notification to both payee and payer of a request payment invoice.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.Currency',
      'foam.core.FObject',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.auth.Subject',
      'foam.nanos.auth.User',
      'foam.nanos.logger.Logger',
      'foam.nanos.notification.Notification',
      'foam.util.SafetyUtil',

      'net.nanopay.auth.PublicUserInfo',
      'net.nanopay.invoice.model.Invoice',
      'static foam.mlang.MLang.*'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
           agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                Invoice iv = (Invoice) obj;
                DAO localUserDAO = (DAO) x.get("localUserDAO");
                Logger logger = (Logger) x.get("logger");

                PublicUserInfo payer = (PublicUserInfo) iv.getPayer();
                User user = ((Subject) x.get("subject")).getUser();

                PublicUserInfo payee = (PublicUserInfo) iv.getPayee();

                Boolean payeeIsCreator =
                    user.getId() == iv.getCreatedBy() &&
                    payee.getId() == user.getId();

                if ( ! payeeIsCreator ) return;

                DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
                Currency currency = (Currency) currencyDAO.find(iv.getDestinationCurrency());

                StringBuilder sb = new StringBuilder("You requested a payment from ")
                  .append(payer.toSummary())
                  .append(" for ")
                  .append(currency.format(iv.getAmount()))
                  .append(" ")
                  .append(iv.getSourceCurrency())
                  .append(".");

                StringBuilder rb = new StringBuilder(user.toSummary())
                .append(" just requested a payment ")
                  .append(" for ")
                  .append(currency.format(iv.getAmount()))
                  .append(" ")
                  .append(iv.getSourceCurrency())
                  .append(".");

                String notificationMsg = sb.toString();
                String payer_notificationMsg = rb.toString();

                // notification to user
                Notification userNotification = new Notification();
                userNotification.setUserId(user.getId());
                userNotification.setBody(notificationMsg);
                userNotification.setNotificationType("Latest_Activity");
                try {
                  user.doNotify(x, userNotification);
                }
                catch (Exception E) { logger.error("Failed to put notification. "+E); };

                // notification to payer
                if ( payer.getId() != user.getId() ) {
                  Notification payerNotification = new Notification();
                  payerNotification.setBody(payer_notificationMsg);
                  payerNotification.setNotificationType("Latest_Activity");
                  try {
                    User sysUser = new User.Builder(x).setId(1).build();
                    X systemX = x.put("subject", new Subject.Builder(x).setUser(sysUser).build());
                    User payerUser = (User) localUserDAO.inX(systemX).find(payer.getId());
                    if ( payerUser != null ) {
                      payerUser.doNotify(x, payerNotification);
                    } else {
                      logger.warning("Cannot find payer " + payer.getId() + " for request payment notification");
                    }
                  }
                  catch (Exception E) { logger.error("Failed to put notification. "+E); };
                }

              }
           },"send a Ablii Completed notification");
        `
      }
    ]
  });
