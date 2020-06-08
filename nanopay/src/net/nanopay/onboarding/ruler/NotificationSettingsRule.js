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
  package: 'net.nanopay.onboarding.ruler',
  name: 'NotificationSettingsRule',

  documentation: `Creates default notification settings on user create`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.EmailSetting',
    'foam.nanos.notification.NotificationSetting',
    'foam.nanos.notification.sms.SMSSetting',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            User user = (User) obj;
            NotificationSetting notificationSetting = new NotificationSetting();
            EmailSetting emailSetting = new EmailSetting();
            SMSSetting smsSetting = new SMSSetting();
            try {
              user.getNotificationSettings(x).put(notificationSetting);
              if ( ! ( user instanceof Business ) ) {
                user.getNotificationSettings(x).put(emailSetting);
                user.getNotificationSettings(x).put(smsSetting);
              }
            } catch ( Exception e ) {
              Logger logger = (Logger) x.get("logger");
              logger.error("Failed to create notification settings for " + user.getId() + ":" + e);
            }
          }
        },"Create default notification settings");
      `
    }
  ]
});
