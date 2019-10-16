foam.CLASS({
    package: 'net.nanopay.invoice.ruler',
    name: 'RequestPaymentNotificationRule',

    documentation: 'An action that sends a notification to both user and payer of request payment invoice',

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.FObject',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.auth.User',
      'foam.nanos.logger.Logger',
      'foam.core.ContextAgent',
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
                User user = (User) x.get("user");

                User payee = iv.getPayee()

                Boolean payeeIsCreator =
                    user.getId() == iv.getCreatedBy() &&
                    payee.getId() == user.getId();

                if ( ! payeeIsCreator ) return;

                DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
                Currency currency = (Currency) currencyDAO.find(iv.getDestinationCurrency());

                StringBuilder sb = new StringBuilder("You requested a payment from ")
                .append(payer.label())
                .append(" for ")
                .append(currency.format(iv.getAmount()))
                .append(" ")
                .append(iv.getSourceCurrency());

                StringBuilder rb = new StringBuilder(user.label())
                .append(" just requested a payment ")
                .append(" for ")
                .append(currency.format(iv.getAmount()))
                .append(" ")
                .append(iv.getSourceCurrency());

                sb.append(".");
                rb.append(".");
                String notificationMsg = sb.toString();
                String payer_notificationMsg = rb.toString();
                
                // notification to user
                Notification userNotification = new Notification();
                userNotification.setUserId(user.getId());
                userNotification.setBody(notificationMsg);
                userNotification.setNotificationType("Transaction Initiated");
                userNotification.setIssuedDate(iv.getIssueDate());
                try {
                  notificationDAO.put_(x, userNotification);
                }
                catch (Exception E) { logger.error("Failed to put notification. "+E); };

                // notification to payer
                if ( payer.getId() != user.getId() ) {
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