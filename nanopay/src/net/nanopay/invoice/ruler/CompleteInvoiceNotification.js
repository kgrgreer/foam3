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
  name: 'CompleteInvoiceNotification',

  documentation: 'An action that sends a notification to both sender and receiver of ablii transaction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.i18n.TranslationService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',

    'java.util.Date',

    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',

    'static foam.mlang.MLang.*',
  ],

  messages: [
    { name: 'NOTIFICATION_BODY_1', message: 'You have received payment from '},
    { name: 'NOTIFICATION_BODY_2', message: ' has received your payment '},
    { name: 'NOTIFICATION_BODY_3', message: ' for '}
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
              PublicUserInfo payee = (PublicUserInfo) iv.getPayee();

              Subject subject = new Subject.Builder(x).setUser(new User.Builder(x).setId(1).build()).build();
              X systemX = x.put("subject", subject);
              User payerUser = (User) localUserDAO.inX(systemX).find(payer.getId());
              User payeeUser = (User) localUserDAO.inX(systemX).find(payee.getId());

              DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
              Currency currency = (Currency) currencyDAO.find(iv.getDestinationCurrency());

              TranslationService ts = (TranslationService) x.get("translationService");
              String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();

              String notification1 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_1", NOTIFICATION_BODY_1);
              String notification3 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_3", NOTIFICATION_BODY_3);

              StringBuilder sb = new StringBuilder(notification1)
                .append(payer.toSummary())
                .append(notification3)
                .append(currency.format(iv.getAmount()))
                .append(" ")
                .append(iv.getSourceCurrency())
                .append(".");

              String notification2 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_2", NOTIFICATION_BODY_2);
              StringBuilder rb = new StringBuilder(payee.toSummary())
                .append(notification2)
                .append(notification3)
                .append(currency.format(iv.getAmount()))
                .append(" ")
                .append(iv.getSourceCurrency())
                .append(".");

              String notificationMsg = sb.toString();
              String payer_notificationMsg = rb.toString();

              // notification to payee
              Notification payeeNotification = new Notification();
              payeeNotification.setUserId(payee.getId());
              payeeNotification.setBody(notificationMsg);
              payeeNotification.setNotificationType("Latest_Activity");

              try {
                if ( payeeUser != null ) {
                  payeeUser.doNotify(x, payeeNotification);
                } else {
                  logger.warning("Cannot find payee " + payee.getId() + " for complete invoice notification");
                }
              }
              catch (Exception E) { logger.error("Failed to put notification. "+E); };

              // notification to payer
              if ( payer.getId() != payee.getId() ) {
                Notification payerNotification = new Notification();
                payerNotification.setUserId(payer.getId());
                payerNotification.setBody(payer_notificationMsg);
                payerNotification.setNotificationType("Latest_Activity");
                try {
                  if ( payerUser != null ) {
                    payerUser.doNotify(x, payerNotification);
                  } else {
                    logger.warning("Cannot find payer " + payer.getId() + " for complete invoice notification");
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
