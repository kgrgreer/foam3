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
  name: 'SendNotificationOnPut',
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

            StringBuilder sb = new StringBuilder();
            sb.append("Capability: ");
            sb.append(capability.getName());
            sb.append(" was updated for user email: ");
            sb.append(user.getEmail());
            sb.append(", ID: ");
            sb.append(String.valueOf(user.getId()));
            sb.append(" with status ");
            sb.append(ucj.getStatus().getLabel());

            args.put("email", user.getEmail());
            args.put("status", ucj.getStatus().getLabel());
            args.put("description", sb.toString());
            
            try {
              EmailsUtility.sendEmailFromTemplate(x, user, message, "onboarding-capability-compliance-notification", args);
            } catch (Throwable t) {
              ((Logger) x.get("logger")).error("Error sending email for updated Capability: " + capability.getName(), t);
            }
          }
        }, "SendEmailOnUCJGranted");
      `
    }
  ]
});
