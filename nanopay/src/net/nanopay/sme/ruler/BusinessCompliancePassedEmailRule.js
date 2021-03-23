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
    name: 'BusinessCompliancePassedEmailRule',

    documentation: `Sends email to signing officer after their business passes compliance.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.app.AppConfig',
      'foam.nanos.auth.Address',
      'foam.nanos.auth.Group',
      'foam.nanos.auth.User',
      'foam.nanos.crunch.UserCapabilityJunction',
      'foam.nanos.logger.Logger',
      'foam.nanos.notification.Notification',
      'net.nanopay.model.Business',
      'net.nanopay.sme.ruler.BusinessCompliancePassedEmailNotification',
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
            if ( ! (obj instanceof UserCapabilityJunction) ) return;
            DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
            Business business = (Business) localBusinessDAO.find(((UserCapabilityJunction) obj).getSourceId());
            Address businessAddress = business.getAddress();

            if ( businessAddress != null ) {
              Logger                  logger         = (Logger) x.get("logger");
              Group                   group          = business.findGroup(x);
              AppConfig               config         = group != null ? (AppConfig) group.getAppConfig(x) : (AppConfig) x.get("appConfig");
              Map<String, Object>     args           = new HashMap<>();

              args.put("link",   config.getUrl() + "#mainmenu.dashboard");
              args.put("sendTo", User.EMAIL);
              args.put("business", business.getOrganization());

              if ( group == null ) {
                logger.error("Error sending compliance-notification-to-user email, group is null.");
                return;
              }
              try {

                Notification businessCompliancePassedNotification = new BusinessCompliancePassedEmailNotification.Builder(x)
                  .setNotificationType("Latest_Activity")
                  .setGroupId(group.toString())
                  .setEmailArgs(args)
                  .setEmailName("compliance-notification-to-user")
                  .build();

                business.doNotify(x, businessCompliancePassedNotification);

              } catch (Exception e) {
                logger.error("Error sending compliance-notification-to-user email.", e);
              }
            }
          }
        }, "send business compliance passed email");
        `
      }
    ]
});
