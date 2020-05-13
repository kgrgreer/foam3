foam.CLASS({
  package: 'net.nanopay.invoice.ruler',
  name: 'CompleteInvoiceNotification',

  documentation: 'An action that sends a notification to both sender and receiver of ablii transaction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'java.util.Date',
    'foam.core.X',
    'foam.core.ContextAgent',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'foam.core.Currency',
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

              X systemX = x.put("user", new User.Builder(x).setId(1).build());
              User payerUser = (User) localUserDAO.inX(systemX).find(payer.getId());
              User payeeUser = (User) localUserDAO.inX(systemX).find(payee.getId());

              DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
              Currency currency = (Currency) currencyDAO.find(iv.getDestinationCurrency());

              StringBuilder sb = new StringBuilder("You have received payment from ")
                .append(payer.toSummary())
                .append(" for ")
                .append(currency.format(iv.getAmount()))
                .append(" ")
                .append(iv.getSourceCurrency())
                .append(".");

              StringBuilder rb = new StringBuilder(payee.toSummary())
                .append(" has received your payment ")
                .append(" for ")
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
              payeeNotification.setIssuedDate(new Date());
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
                payerNotification.setIssuedDate(new Date());
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
