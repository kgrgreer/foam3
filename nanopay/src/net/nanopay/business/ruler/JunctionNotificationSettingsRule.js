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
  package: 'net.nanopay.business.ruler',
  name: 'JunctionNotificationSettingsRule',

  documentation: `Creates default notification settings on agentJunction create`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.EmailSetting',
    'foam.nanos.notification.NotificationSetting',
    'foam.nanos.notification.sms.SMSSetting',
    'java.util.ArrayList'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserUserJunction userUserJunction = (UserUserJunction) obj;
            NotificationSetting notificationSetting = new NotificationSetting();
            EmailSetting emailSetting = new EmailSetting();
            SMSSetting smsSetting = new SMSSetting();
            try {
              userUserJunction.getNotificationSettingsForUserUsers(x).put(notificationSetting);
              userUserJunction.getNotificationSettingsForUserUsers(x).put(emailSetting);
              userUserJunction.getNotificationSettingsForUserUsers(x).put(smsSetting);
            } catch ( Exception e ) {
              Logger logger = (Logger) x.get("logger");
              logger.error("Failed to create notification settings for " + "src:" + userUserJunction.getSourceId() + " target:" + userUserJunction.getTargetId() + ":" + e);
            }
          }
      },"Create junction notification setting");
      `
    }
  ]
});
