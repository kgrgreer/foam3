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
              .setGroupId(user.getSpid() + "-payment-ops")
              .build();

              DAO notificationDAO = (DAO) getX().get("localNotificationDAO");
              notificationDAO.put(notification);
          }
        }, "send notification");
        `
      }
    ]
});
