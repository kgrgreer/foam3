foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'SendDeclinedCINotification',

  documentation: 'An action that sends a notification to both sender and receiver of ablii transaction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Currency',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.model.Business',
    'net.nanopay.tx.model.Transaction',
    'java.text.NumberFormat',
    'java.util.HashMap'

  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              // SETUP
              DAO currencyDAO = (DAO) x.get("currencyDAO");
              DAO notificationDAO = ((DAO) x.get("localNotificationDAO"));
              Logger logger  = (Logger) x.get("logger");

              Notification notification = new Notification();
              notification.setEmailIsEnabled(true);

              Transaction t = (Transaction) obj; // used through loop
              Transaction tx = (Transaction) obj; //keep original object
              while ( t != null && !(t instanceof net.nanopay.tx.AbliiTransaction) ){
                t = (Transaction) t.findParent(x);
              }

              // CHECK IF ABLII-TRANSACTION FOUND
              long invoiceId = 0;
              Business sender = null;
              Business receiver = null;
              if ( t == null || !(t instanceof net.nanopay.tx.AbliiTransaction) ) {
                sender = (Business) tx.findSourceAccount(x).findOwner(x);
                receiver = (Business) tx.findDestinationAccount(x).findOwner(x);
              } else {
                invoiceId = t.getInvoiceId();
                sender = (Business) t.findSourceAccount(x).findOwner(x);
                receiver = (Business) t.findDestinationAccount(x).findOwner(x);
              }

              // DEPENDING ON ABOVE - send either 'pay-from-bank-account-reject' or 'cashin-reject' email
              if ( invoiceId != 0 ) {
                notification.setBody("Transaction for invoice #" + invoiceId + " was rejected. Receiver's balance was reverted, invoice was not paid.");
                notification.setUserId(sender.getId());
                notification.setNotificationType("Reject invoice payment");
                notification.setEmailName("pay-from-bank-account-reject");

                HashMap<String, Object> args = new HashMap<>();
                AppConfig config = (AppConfig) (sender.findGroup(x)).getAppConfig(x);

                DAO invoiceDAO = (DAO) x.get("invoiceDAO");
                Invoice invoice = (Invoice) invoiceDAO.find(invoiceId);
                Currency currency = (Currency) currencyDAO.find(invoice.getDestinationCurrency());

                if ( ! Invoice.INVOICE_NUMBER.isDefaultValue(invoice) ) {
                  args.put("invoiceNumber", invoice.getInvoiceNumber());
                }

                User signingOfficer = sender.getSigningOfficer(x);

                args.put("amount", currency.format(t.getAmount()));
                args.put("toName", signingOfficer.getFirstName());
                args.put("name", receiver.label());
                args.put("reference", invoice.getReferenceId());
                args.put("sendTo", sender.getEmail());
                args.put("account", ((BankAccount) t.findSourceAccount(x)).getAccountNumber());
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
                HashMap<String, Object> args = new HashMap<>();
                AppConfig config;
                String group = receiver.getGroup();
                if ( SafetyUtil.isEmpty(group) ) {
                  config = (AppConfig) x.get("appConfig");
                } else {
                  config = (AppConfig) (receiver.findGroup(x)).getAppConfig(x);
                }
                Currency currency = (Currency) currencyDAO.find(tx.getSourceCurrency());
                String bankAccountNumber = ((BankAccount) tx.findSourceAccount(x)).getAccountNumber();
                args.put("amount", currency.format(tx.getAmount()));
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
