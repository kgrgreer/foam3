foam.CLASS({
  package: 'net.nanopay.invoice.ruler',
  name: 'CompleteInvoiceNotification',

  documentation: 'An action that sends a notification to both sender and receiver of ablii transaction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.core.ContextAgent',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.model.Currency',
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
              DAO notificationDAO = (DAO) x.get("localNotificationDAO");
              Logger logger = (Logger) x.get("logger");

              PublicUserInfo payer = (PublicUserInfo) iv.getPayer();
              PublicUserInfo payee = (PublicUserInfo) iv.getPayee();

              DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
              Currency currency = (Currency) currencyDAO.find(iv.getDestinationCurrency());

              StringBuilder sb = new StringBuilder("You have received payment from ")
              .append(payer.label())
              .append(" for ")
              .append(currency.format(iv.getAmount()))
              .append(" ")
              .append(iv.getSourceCurrency());

              StringBuilder rb = new StringBuilder(payee.label())
              .append(" has revieved your payment ")
              .append(" for ")
              .append(currency.format(iv.getAmount()))
              .append(" ")
              .append(iv.getSourceCurrency());
              sb.append(".");
              rb.append(".");
              String notificationMsg = sb.toString();
              String payer_notificationMsg = rb.toString();
              
              // notification to payee
              Notification payeeNotification = new Notification();
              payeeNotification.setUserId(payee.getId());
              payeeNotification.setBody(notificationMsg);
              payeeNotification.setNotificationType("Transaction Initiated");
              payeeNotification.setIssuedDate(iv.getIssueDate());
              try {
                notificationDAO.put_(x, payeeNotification);
              }
              catch (Exception E) { logger.error("Failed to put notification. "+E); };
              // notification to payer
              if ( payer.getId() != payee.getId() ) {
              Notification payerNotification = new Notification();
              payerNotification.setUserId(payer.getId());
              payerNotification.setBody(payer_notificationMsg);
              payerNotification.setNotificationType("Transaction Initiated");
              payerNotification.setIssuedDate(iv.getIssueDate());
              try {
                notificationDAO.put_(x, payerNotification);
              }
              catch (Exception E) { logger.error("Failed to put notification. "+E); };
            }

            }
         },"send a Ablii Completed notification");
      `
    }
  ]
});
