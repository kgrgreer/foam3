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
  name: 'SendExpiryNotification',
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
    'foam.nanos.notification.Notification',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.List',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'NOTIF_PRE', message: 'Your capability \"' },
    { name: 'EXPIRY_NOTIF_SUF', message: '\" has expired.' },
    { name: 'GRACE_PERIOD_NOTIF_SUF_1', message: '\" has transitioned into a grace period of ' },
    { name: 'GRACE_PERIOD_NOTIF_SUF_2', message: ' days.' },
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

            Notification notification = new Notification();

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

            if ( junction.getIsInGracePeriod() ) {
              String p1 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIF_PRE", NOTIF_PRE);
              String p2 = ts.getTranslation(locale, getClassInfo().getId()+ ".GRACE_PERIOD_NOTIF_SUF_1", GRACE_PERIOD_NOTIF_SUF_1);
              String p3 = ts.getTranslation(locale, getClassInfo().getId()+ ".GRACE_PERIOD_NOTIF_SUF_2", GRACE_PERIOD_NOTIF_SUF_2);
              String body = new StringBuilder(p1)
                .append(capabilityName)
                .append(p2)
                .append(junction.getGracePeriod())
                .append(p3)
                .toString();
              args.put("gracePeriod", junction.getGracePeriod());
              notification.setBody(body);
              notification.setEmailName("ucjGracePeriodNotification");
            } else {
              String p1 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIF_PRE", NOTIF_PRE);
              String p2 = ts.getTranslation(locale, getClassInfo().getId()+ ".EXPIRY_NOTIF_SUF", EXPIRY_NOTIF_SUF);
              String body = new StringBuilder(p1)
                .append(capabilityName)
                .append(p2)
                .toString();
              notification.setBody(body);
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
