foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'SendDeclinedCINotification',

  documentation: 'An action that sends a notification to both sender and receiver of ablii transaction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.core.ContextAgent',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.model.Currency',
    'net.nanopay.tx.model.Transaction',
    'java.text.NumberFormat',
    'java.util.HashMap',

  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {

              Transaction tx = (Transaction) obj;
              DAO notificationDAO = ((DAO) x.get("localNotificationDAO"));
              Transaction t = tx;
              while ( !(t instanceof net.nanopay.tx.AbliiTransaction) ){
                tx = (Transaction) tx.findParent(x);
              }
              Logger logger  = (Logger) x.get("logger");
              User sender = t.findSourceAccount(x).findOwner(x);
              User receiver = t.findDestinationAccount(x).findOwner(x);
              Notification notification = new Notification();
              notification.setEmailIsEnabled(true);

              // Traverse the chain to find the invoiceId if there is one.
              DAO localTransactionDAO = (DAO) x.get("localTransactionDAO");
              long invoiceId = t.getInvoiceId();

              if ( invoiceId != 0 ) {
                notification.setBody("Transaction for invoice #" + invoiceId + " was rejected. Receiver's balance was reverted, invoice was not paid.");
                notification.setUserId(sender.getId());
                notification.setNotificationType("Reject invoice payment");
                notification.setEmailName("pay-from-bank-account-reject");

                HashMap<String, Object> args = new HashMap<>();
                AppConfig config = (AppConfig) (sender.findGroup(x)).getAppConfig(x);

                DAO invoiceDAO = (DAO) x.get("invoiceDAO");
                Invoice invoice = (Invoice) invoiceDAO.find(invoiceId);
                DAO currencyDAO = (DAO) x.get("currencyDAO");
                Currency currency = (Currency) currencyDAO.find(invoice.getDestinationCurrency());

                if ( ! Invoice.INVOICE_NUMBER.isDefaultValue(invoice) ) {
                  args.put("invoiceNumber", invoice.getInvoiceNumber());
                }

                args.put("amount", currency.format(tx.getAmount()));
                args.put("toName", sender.label());
                args.put("name", receiver.label());
                args.put("reference", invoice.getReferenceId());
                args.put("sendTo", sender.getEmail());
                args.put("account", ((BankAccount) tx.findSourceAccount(x)).getAccountNumber());
                args.put("payerName", sender.getFirstName());
                args.put("payeeName", receiver.getFirstName());
                args.put("link", config.getUrl());

                notification.setEmailArgs(args);
                notificationDAO.put(notification);
              } else {
                notification.setBody("Your Cash In transaction was rejected.");
                notification.setUserId(receiver.getId());
                notification.setNotificationType("Reject Cash in transaction");
                notification.setEmailName("cashin-reject");
                NumberFormat formatter = NumberFormat.getCurrencyInstance();
                HashMap<String, Object> args = new HashMap<>();
                AppConfig config;
                String group = receiver.getGroup();
                if ( SafetyUtil.isEmpty(group) ) {
                  config = (AppConfig) x.get("appConfig");
                } else {
                  config = (AppConfig) (receiver.findGroup(x)).getAppConfig(x);
                }

                String bankAccountNumber = ((BankAccount) tx.findSourceAccount(x)).getAccountNumber();
                args.put("amount", formatter.format(tx.getAmount() / 100.00));
                args.put("name", receiver.getFirstName());
                args.put("account", bankAccountNumber.substring(bankAccountNumber.length()-4, bankAccountNumber.length()));
                args.put("link",    config.getUrl());

                notification.setEmailArgs(args);
                try {
                  notificationDAO.put(notification);
                }
                catch (Exception E) { logger.error("Failed to put notification. "+E); };
              }

            }
         },"send Declined CashIn notification");
      `
    }
  ]
});
