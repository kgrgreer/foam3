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
  name: 'CompleteInvoiceNotificationRule',

  documentation: 'An action that sends a notification to both sender and receiver of ablii transaction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'java.util.Date',

    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.ruler.CompleteInvoiceNotification',

    'static foam.mlang.MLang.*',
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
              CompleteInvoiceNotification notification = new CompleteInvoiceNotification();
              notification.setPayerId(payer.getId());
              notification.setPayeeId(payee.getId());
              notification.setAmount(currency.format(iv.getAmount()));
              notification.setSourceCurrency(iv.getSourceCurrency());
              notification.setNotificationType("Latest_Activity");

              // notification to payee
              try {
                if ( payeeUser != null ) {
                  notification.setUserId(payee.getId());
                  notification.setSummary(payer.toSummary());
                  payeeUser.doNotify(x, notification);
                } else {
                  logger.warning("Cannot find payee " + payee.getId() + " for complete invoice notification");
                }
              }
              catch ( Exception E ) { logger.error("Failed to put notification. " + E); };

              // notification to payer
              if ( payer.getId() != payee.getId() ) {
                notification.setUserId(payer.getId());
                notification.setSummary(payee.toSummary());
                try {
                  if ( payerUser != null ) {
                    payerUser.doNotify(x, notification);
                  } else {
                    logger.warning("Cannot find payer " + payer.getId() + " for complete invoice notification");
                  }
                }
                catch ( Exception E ) { logger.error("Failed to put notification. " + E); };
              }
            }
         }, "send a Ablii Completed notification");
      `
    }
  ]
});
