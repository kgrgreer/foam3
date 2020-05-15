foam.CLASS({
    package: 'net.nanopay.invoice.ruler',
    name: 'InvoiceVoidEmailRule',

    documentation: `Sends email to payer notifying them that the invoice has been voided.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.FObject',
      'foam.core.X',
      'foam.nanos.app.AppConfig',
      'foam.nanos.auth.Group',
      'foam.nanos.auth.Subject',
      'foam.nanos.auth.User',
      'foam.nanos.logger.Logger',
      'foam.nanos.notification.Notification',
      'foam.nanos.notification.email.EmailMessage',
      'foam.nanos.theme.Theme',
      'foam.nanos.theme.Themes',
      'foam.util.SafetyUtil',

      'java.text.NumberFormat',
      'java.util.HashMap',

      'net.nanopay.invoice.model.Invoice',
      'net.nanopay.invoice.model.PaymentStatus'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Invoice         invoice    = (Invoice) obj;
            User            payer      = (User) invoice.findPayerId(x);
            User            payee      = (User) invoice.findPayeeId(x);
            Group           payerGroup = (Group) payer.findGroup(x);
            AppConfig       config     = (AppConfig) payerGroup.getAppConfig(x);
            Subject subject = new Subject.Builder(x).setUser(payer).build();
            Theme          theme      = ((Themes) x.get("themes")).findTheme(x.put("subject", subject));
            EmailMessage    message    = new EmailMessage();
            NumberFormat    formatter  = NumberFormat.getCurrencyInstance();

            String accountVar = SafetyUtil.isEmpty(invoice.getInvoiceNumber()) ?
              (SafetyUtil.isEmpty(invoice.getPurchaseOrder()) ? "N/A" : invoice.getPurchaseOrder()) :
              invoice.getInvoiceNumber();

            message.setTo(new String[]{payer.getEmail()});
            HashMap<String, Object> args = new HashMap<>();
            args.put("account",  accountVar);
            args.put("amount",   formatter.format(invoice.getAmount()/100.00));
            args.put("link",     config.getUrl());
            args.put("fromName", payee.toSummary());
            args.put("toName", User.FIRST_NAME);
            args.put("sendTo",   User.EMAIL);
            args.put("supportEmail", theme.getSupportEmail());

            try{

              Notification invoiceVoidedNotification = new Notification.Builder(x)
                .setBody(accountVar + " has been void.")
                .setNotificationType("InvoiceVoid")
                .setEmailArgs(args)
                .setEmailName("voidInvoice")
                .build();

              payer.doNotify(x, invoiceVoidedNotification);

            } catch(Throwable t) {
              ((Logger) x.get(Logger.class)).error("Error sending invoice voided email.", t);
            }

          }
        }, "send payer invoice voided email");
        `
      }
    ]
});
