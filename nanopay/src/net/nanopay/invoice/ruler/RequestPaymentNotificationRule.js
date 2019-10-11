foam.CLASS({
    package: 'net.nanopay.invoice.ruler',
    name: 'RequestPaymentNotificationRule',
  
    documentation: 'An action that sends a notification to both sender and receiver of request payment invoice',
  
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
      'net.nanopay.invoice.model.Invoice',
      'net.nanopay.model.Currency',
      'net.nanopay.auth.PublicUserInfo'
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


                PublicUserInfo receiver = (PublicUserInfo) iv.getPayer();
                User sender = (User) x.get("user");

                DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
                Currency currency = (Currency) currencyDAO.find(iv.getDestinationCurrency());

                StringBuilder sb = new StringBuilder(sender.label())
                .append(" just request a payment from ")
                .append(receiver.label())
                .append(" for ")
                .append(currency.format(iv.getAmount()))
                .append(" ")
                .append(iv.getSourceCurrency());

                sb.append(".");
                String notificationMsg = sb.toString();

                // notification to sender
              Notification senderNotification = new Notification();
              senderNotification.setUserId(sender.getId());
              senderNotification.setBody(notificationMsg);
              senderNotification.setNotificationType("Transaction Initiated");
              senderNotification.setIssuedDate(iv.getIssueDate());
              try {
                notificationDAO.put_(x, senderNotification);
              }
              catch (Exception E) { logger.error("Failed to put notification. "+E); };

              // notification to receiver
              if ( receiver.getId() != sender.getId() ) {
                Notification receiverNotification = new Notification();
                receiverNotification.setUserId(receiver.getId());
                receiverNotification.setBody(notificationMsg);
                receiverNotification.setNotificationType("Transaction Initiated");
                receiverNotification.setIssuedDate(iv.getIssueDate());
                try {
                  notificationDAO.put_(x, receiverNotification);
                }
                catch (Exception E) { logger.error("Failed to put notification. "+E); };
              }

              }
           },"send a Ablii Completed notification");
        `
      }
    ]
  });