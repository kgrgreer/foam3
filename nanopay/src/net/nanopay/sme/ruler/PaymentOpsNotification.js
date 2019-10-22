foam.CLASS({
    package: 'net.nanopay.sme.ruler',
    name: 'PaymentOpsNotification',
    extends: 'foam.dao.ProxyDAO',

    documentation: `A rule that sends a notification to both payee and payer of a request payment invoice.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.FObject',
      'foam.core.PropertyInfo',
      'foam.core.X',
      'foam.dao.ArraySink',
      'foam.dao.DAO',
      'foam.dao.ProxyDAO',
      'foam.mlang.MLang',
      'foam.mlang.predicate.Predicate',
      'foam.nanos.auth.User',
      'foam.nanos.logger.Logger',
      'foam.nanos.notification.Notification',
      'foam.nanos.notification.email.EmailMessage',
      'foam.util.Emails.EmailsUtility',
      'net.nanopay.account.Account',
      'net.nanopay.admin.model.AccountStatus',
      'net.nanopay.bank.BankAccount',
      'net.nanopay.bank.BankAccountStatus',
      'net.nanopay.model.Business',
      'net.nanopay.sme.OnboardingPaymentOpsNotification',
      'java.util.HashMap',
      'java.util.List',
      'java.util.Map'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
           agency.submit(x, new ContextAgent() {
            @Override
             public void execute(X x) {
              User user = (User) obj; 
              if (user == null && user.getId() <= 0) return;
              EmailMessage message = new EmailMessage();
              Map<String, Object>  args = new HashMap<>();

              String bobo = user.getId() + " is the user that";
              Notification notification = new Notification.Builder(x)
              .setEmailArgs(args)
              .setBody(bobo)
              .setUserId(user.getId())
              .build();
              
          }
        }, "send notification");
        `
      }
    ]
});
