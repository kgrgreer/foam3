/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.crunch.compliance',
  name: 'SendEmailOnUCJUpdate',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Sends email to compliance when specified UCJ is Granted`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'java.util.HashMap',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            User user = (User) ucj.findSourceId(x);
            Capability capability = (Capability) ucj.findTargetId(x);
            
            EmailMessage message = new EmailMessage();
            Map<String, Object> args = new HashMap<>();

            args.put("title", "Capability updated for user ID " + user.getId());
            args.put("subTitle1", "Capability status update");
            args.put("subTitle2", capability.getName() + " was updated for user ID " + user.getId() + " with status " + ucj.getStatus().getLabel());
            args.put("userId", String.valueOf(user.getId()));
            args.put("userEmail", user.getEmail());

            try {
              EmailsUtility.sendEmailFromTemplate(x, user, message, "notification-to-onboarding-team", args);
            } catch (Throwable t) {
              ((Logger) x.get("logger")).error("Error sending email for updated Capability: " + capability.getName(), t);
            }
          }
        }, "SendEmailOnUCJGranted");
      `
    }
  ]
});
