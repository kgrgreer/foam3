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
  package: 'net.nanopay.notification',
  name: 'TriggerDoNotifyTestAction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              User user = ((Subject) x.get("subject")).getUser();

              Logger logger = (Logger) x.get("logger");
              logger.info("Sending notification to: " + user);

              StringBuilder sb = new StringBuilder(user.toSummary())
                .append(" is getting a test notification through doNotify ");

              String notificationMsg = sb.toString();

              Notification notification = new Notification();
              notification.setUserId(user.getId());
              notification.setBody(notificationMsg);
              notification.setNotificationType("Test_Notification");
              try {
                user.doNotify(x, notification);
              }
              catch (Exception e) {
                logger.error("Failed to put notification. " + e);
              }
            }
         },"Test notification");
      `
    }
  ]
});
