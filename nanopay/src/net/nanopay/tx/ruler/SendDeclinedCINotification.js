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
              Logger logger  = (Logger) x.get("logger");

              Notification notification = new Notification();

              if ( obj == null ) return; 
              Transaction t = (Transaction) obj; // used through loop
              Transaction tx = (Transaction) obj; //keep original object
              while ( t != null && !(t instanceof net.nanopay.tx.AbliiTransaction) ){
                t = (Transaction) t.findParent(x);
              }

              // CHECK IF ABLII-TRANSACTION FOUND
              long invoiceId = 0;
              User sender = null;
              User receiver = null;
              if ( t == null ||
                   ! ( t instanceof net.nanopay.tx.AbliiTransaction ) ) {
                sender = (User) tx.findSourceAccount(x).findOwner(x);
                receiver = (User) tx.findDestinationAccount(x).findOwner(x);
              } else {
                invoiceId = t.getInvoiceId();
                sender = (User) t.findSourceAccount(x).findOwner(x);
                receiver = (User) t.findDestinationAccount(x).findOwner(x);
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

                User signingOfficer = null;
                if ( sender instanceof Business ) {
                  signingOfficer = ((Business)sender).findSigningOfficer(x);
                }

                args.put("amount", currency.format(t.getAmount()));
                args.put("toName", (signingOfficer != null) ?
                  signingOfficer.getFirstName() :
                  sender.toSummary()
                );
                args.put("name", receiver.toSummary());
                args.put("reference", invoice.getReferenceId());
                args.put("sendTo", sender.getEmail());
                args.put("account", ((BankAccount) t.findSourceAccount(x)).getAccountNumber());
                args.put("payerName", sender.getFirstName());
                args.put("payeeName", receiver.getFirstName());
                args.put("link", config.getUrl());

                notification.setEmailArgs(args);
                sender.doNotify(x, notification);
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
                args.put("account", BankAccount.mask(bankAccountNumber));
                args.put("link",    config.getUrl());

                notification.setEmailArgs(args);
                try {
                  receiver.doNotify(x, notification);
                }
                catch (Exception E) { logger.error("Failed to put notification. "+E); };
              }

            }
         },"send Declined CashIn notification");
      `
    }
  ]
});
