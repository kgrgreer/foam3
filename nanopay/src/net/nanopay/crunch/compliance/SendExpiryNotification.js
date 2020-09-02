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

  documentation: `end notification to user when UCJ transitions to grace period.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.notification.Notification',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.List',
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
            
            DAO notificationDAO = (DAO) x.get("notificationDAO");

            Notification notification = new Notification();

            HashMap<String, Object> args = new HashMap<>();
            args.put("link", user.findGroup(x).getAppConfig(x).getUrl());

            // if the UserCapabilityJunction belongs to an actual user, send the notification to the user.
            // otherwise, send the notification to the group the user is under
            if ( user.getClass().equals(User.class) ) {
              notification.setUserId(user.getId());
              args.put("userName", user.getLegalName());
            }
            else { 
              notification.setGroupId(user.getGroup());
              args.put("userName", ((net.nanopay.model.Business) user).getBusinessName());
            }

            notification.setNotificationType("Capability Expiry Reminder");
            notification.setCreated(new Date());

            if ( junction.getIsInGracePeriod() ) {
              String body = new StringBuilder(NOTIF_PRE)
                .append(cap.getName())
                .append(GRACE_PERIOD_NOTIF_SUF_1)
                .append(junction.getGracePeriod())
                .append(GRACE_PERIOD_NOTIF_SUF_2)
                .toString();
              args.put("body", body);
              notification.setBody(body);
              notification.setEmailName("ucjGracePeriodNotification");
            } else {
              String body = new StringBuilder(NOTIF_PRE)
                .append(cap.getName())
                .append(EXPIRY_NOTIF_SUF)
                .toString();
              args.put("body", body);
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
