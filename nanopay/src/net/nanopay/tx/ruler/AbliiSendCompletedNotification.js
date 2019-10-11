foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'AbliiSendCompletedNotification',

  documentation: 'An action that sends a notification to both sender and receiver of ablii transaction',

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
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              Transaction tx = (Transaction) obj;
              DAO localUserDAO = (DAO) x.get("localUserDAO");
              DAO notificationDAO = (DAO) x.get("localNotificationDAO");
              Invoice invoice = tx.findInvoiceId(x);
              Logger logger = (Logger) x.get("logger");

              User sender = tx.findSourceAccount(x).findOwner(x);
              User receiver = (User) localUserDAO.find(tx.findDestinationAccount(x).getOwner());

              DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
              Currency currency = (Currency) currencyDAO.find(tx.getDestinationCurrency());

              StringBuilder sb = new StringBuilder(sender.label())
                .append(" just initiated a payment to ")
                .append(receiver.label())
                .append(" for ")
                .append(currency.format(tx.getDestinationAmount()))
                .append(" ")
                .append(tx.getDestinationCurrency());

                StringBuilder rb = new StringBuilder()
                .append(" Payment has been initiated by ")
                .append(sender.label());
              
              if (
                invoice.getInvoiceNumber() != null &&
                ! SafetyUtil.isEmpty(invoice.getInvoiceNumber())
              ) {
                sb.append(" on Invoice#: ")
                  .append(invoice.getInvoiceNumber());
              }

              if ( invoice.getPurchaseOrder().length() > 0 ) {
                sb.append(" and P.O: ");
                sb.append(invoice.getPurchaseOrder());
              }

              sb.append(".");
              String notificationMsg = sb.toString();
              String receiver_notificationMsg = rb.toString();

              // notification to sender
              Notification senderNotification = new Notification();
              senderNotification.setUserId(sender.getId());
              senderNotification.setBody(notificationMsg);
              senderNotification.setNotificationType("Transaction Initiated");
              senderNotification.setIssuedDate(invoice.getIssueDate());
              try {
                notificationDAO.put_(x, senderNotification);
              }
              catch (Exception E) { logger.error("Failed to put notification. "+E); };

              // notification to receiver
              if ( receiver.getId() != sender.getId() ) {
                Notification receiverNotification = new Notification();
                receiverNotification.setUserId(receiver.getId());
                receiverNotification.setBody(receiver_notificationMsg);
                receiverNotification.setNotificationType("Transaction Initiated");
                receiverNotification.setIssuedDate(invoice.getIssueDate());
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
