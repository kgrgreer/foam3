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
  package: 'net.nanopay.crunch.compliance',
  name: 'SendExpiryNotificationRule',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Send notification to user when UCJ transitions to grace period.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.i18n.TranslationService',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.List',
    'net.nanopay.crunch.compliance.SendExpiryNotification',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction junction = (UserCapabilityJunction) obj;
            Capability cap = (Capability) junction.findTargetId(x);
            User user = (User) junction.findSourceId(x);

            TranslationService ts = (TranslationService) x.get("translationService");
            Subject subject = (Subject) x.get("subject");
            String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
            String source = cap.getId() + ".name";
            String capabilityName = ts.getTranslation(locale, source, cap.getName());

            SendExpiryNotification notification = new SendExpiryNotification();

            HashMap<String, Object> args = new HashMap<>();
            args.put("link", user.findGroup(x).getAppConfig(x).getUrl());
            args.put("capabilityName", capabilityName);
            args.put("capabilityNameEn", cap.getName());

            // if the UserCapabilityJunction belongs to an actual user, send the notification to the user.
            // otherwise, send the notification to the group the user is under
            if ( ! user.getClass().equals(Business.class) ) {
              String userName = user.getLegalName() != null && ! user.getLegalName().trim().isEmpty() ?
                user.getLegalName() : user.getOrganization();
              notification.setUserId(user.getId());
              args.put("userName", userName);
            } else {
              notification.setGroupId(user.getGroup());
              args.put("userName", ((Business) user).getBusinessName());
            }

            notification.setNotificationType("Capability Expiry Reminder");
            notification.setCreated(new Date());
            notification.setCapabilityName(capabilityName);
            notification.setCapabilitySource(cap.getId() + ".name");

            if ( junction.getIsInGracePeriod() ) {
              notification.setGracePeriod(junction.getGracePeriod());
              args.put("gracePeriod", junction.getGracePeriod());

              notification.setEmailName("ucjGracePeriodNotification");
            } else {
              notification.setEmailName("ucjExpiredNotification");
            }

            notification.setEmailArgs(args);

            user.doNotify(x, notification);
          }
        }, "Send notification to user when UCJ transitions to grace period.");
      `
    }
  ]
});
