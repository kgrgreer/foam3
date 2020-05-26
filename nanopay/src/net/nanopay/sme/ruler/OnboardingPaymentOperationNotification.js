foam.CLASS({
    package: 'net.nanopay.sme.ruler',
    name: 'OnboardingPaymentOperationNotification',
    extends: 'foam.dao.ProxyDAO',

    documentation: ` A rule that send notification and email to Payment Operation team when a new bussiness is onboarding`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAwareAgent',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.auth.User',
      'foam.nanos.auth.UserUserJunction',
      'foam.nanos.notification.email.EmailMessage',
      'java.util.HashMap',
      'java.util.Map',
      'net.nanopay.model.Business',
      'net.nanopay.sme.OnboardingPaymentOpsNotification',
      'static foam.mlang.MLang.*'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
           agency.submit(x, new ContextAwareAgent() {
            @Override
             public void execute(X x) {
              User user = (User) obj;

              if (user == null || user.getId() <= 0) return;
              DAO businessDAO = (DAO) getX().get("businessDAO");
              DAO agentJunctionDAO = (DAO) getX().get("agentJunctionDAO");
              UserUserJunction junction = (UserUserJunction) agentJunctionDAO.find(EQ(UserUserJunction.SOURCE_ID, user.getId()));
              Business business = (Business) businessDAO.find(junction.getTargetId());
              EmailMessage message = new EmailMessage();
              Map<String, Object>  args = new HashMap<>();
              args.put("userId", user.getId());
              args.put("userEmail", user.getEmail());
              args.put("businessId", business.getId());
              args.put("businessName", business.getBusinessName());

              OnboardingPaymentOpsNotification notification = new OnboardingPaymentOpsNotification.Builder(x)
              .setEmailArgs(args)
              .build();

              DAO notificationDAO = (DAO) getX().get("localNotificationDAO");
              notificationDAO.put(notification);
          }
        }, "send notification");
        `
      }
    ]
});
