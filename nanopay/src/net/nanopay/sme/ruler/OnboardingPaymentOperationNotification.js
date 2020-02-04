foam.CLASS({
    package: 'net.nanopay.sme.ruler',
    name: 'OnboardingPaymentOperationNotification',
    extends: 'foam.dao.ProxyDAO',

    documentation: ` A rule that send notification and email to Payment Operation team when a new bussiness is onboarding`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.auth.User',
      'foam.nanos.notification.Notification',
      'foam.nanos.notification.email.EmailMessage',
      'net.nanopay.model.Business',
      'net.nanopay.sme.OnboardingPaymentOpsNotification',
      'java.util.HashMap',
      'java.util.Map',
      'static foam.mlang.MLang.*'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
           agency.submit(x, new ContextAgent() {
            @Override
             public void execute(X x) {
              User user = (User) obj; 

              if (user == null || user.getId() <= 0) return;
              DAO businessDAO = (DAO) x.get("businessDAO");
              Business bs = (Business) businessDAO.find(EQ(Business.EMAIL, user.getEmail()));
              EmailMessage message = new EmailMessage();
              Map<String, Object>  args = new HashMap<>();
              args.put("userId", user.getId());
              args.put("userEmail", user.getEmail());
              args.put("businessId", bs.getId());
              args.put("businessName", bs.getBusinessName());
              args.put("businessEmail", bs.getEmail());

              OnboardingPaymentOpsNotification notification = new OnboardingPaymentOpsNotification.Builder(x)
              .setEmailArgs(args)
              .build();

              DAO notificationDAO = ((DAO) x.get("localNotificationDAO")).inX(x);
              notificationDAO.put(notification);            
          }
        }, "send notification");
        `
      }
    ]
});
