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
  package: 'net.nanopay.crunch',
  name: 'UCJExpiryReminderCron',

  implements: [
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.i18n.TranslationService',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.RenewableData',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.notification.Notification',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.List',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'NOTIFICATION_BODY_P1', message: 'Your Capability \"' },
    { name: 'NOTIFICATION_BODY_P2', message: '\" will expire in ' },
    { name: 'NOTIFICATION_BODY_P3', message: ' days.' }
  ],

  properties: [
    {
      name: 'daysBeforeNotification',
      class: 'Int',
      value: 30
    }
  ],

  methods: [
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode:`
        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

        Date today = new Date();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(today);
        calendar.add(Calendar.DATE, getDaysBeforeNotification());
        Date notifyOnDate = calendar.getTime();

        calendar.add(Calendar.DATE, -1);

        List<UserCapabilityJunction> activeJunctions = ((ArraySink) userCapabilityJunctionDAO
          .where(AND(
              EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED),
              NEQ(UserCapabilityJunction.EXPIRY, null),
              LT(UserCapabilityJunction.EXPIRY, notifyOnDate),
              GT(UserCapabilityJunction.EXPIRY, calendar.getTime())
          ))
          .select(new ArraySink()))
          .getArray();
        if ( activeJunctions.size() == 0 ) return;

        Notification notification = new Notification();
        notification.setNotificationType("Capability Expiry Reminder");
        notification.setCreated(today);
        notification.setEmailName("ucjExpiryReminder");

        HashMap<String, Object> args = new HashMap<>();
        TranslationService ts = (TranslationService) x.get("translationService");

        for ( UserCapabilityJunction ucj : activeJunctions ) {
          User user = (User) ucj.findSourceId(x);
          Capability capability = (Capability) ucj.findTargetId(x);
          String locale = user.getLanguage().getCode().toString();

          String capabilityName = ts.getTranslation(locale, capability.getId() + ".name", capability.getName());
          
          String notificationP1 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_P1", this.NOTIFICATION_BODY_P1);
          String notificationP2 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_P2", this.NOTIFICATION_BODY_P2);
          String notificationP3 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_P3", this.NOTIFICATION_BODY_P3);
          String body = new StringBuilder(notificationP1)
            .append(capabilityName)
            .append(notificationP2)
            .append(getDaysBeforeNotification())
            .append(notificationP3)
            .toString();
          notification.setBody(body);

          args.put("capabilityName", capabilityName);
          args.put("capabilityNameEn", capability.getName());
          args.put("days", getDaysBeforeNotification());
          args.put("link", user.findGroup(x).getAppConfig(x).getUrl());

          if ( ! user.getClass().equals(Business.class) ) {
            String userName = user.getLegalName() != null && ! user.getLegalName().trim().isEmpty() ?
              user.getLegalName() : user.getOrganization();
            notification.setUserId(user.getId());
            args.put("userName", userName);
          } else {
            notification.setGroupId(user.getGroup());
            args.put("userName", ((Business) user).getBusinessName());
          }

          notification.setEmailArgs(args);
          user.doNotify(x, notification);

          args.clear();
          notification.clearEmailArgs();
          notification.clearUserId();
          notification.clearGroupId();
          notification.clearBody();

          configureRenewableData(x, ucj);
        }
      `
    },
    {
      name: 'configureRenewableData',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'ucj', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      javaCode: `
        FObject data = (FObject) ucj.getData();
        if ( data == null || ! ( data instanceof RenewableData ) ) return;

        DAO userCapabilityJunctionDAO = (DAO) x.get("bareUserCapabilityJunctionDAO");

        RenewableData renewable = (RenewableData) data;
        renewable.setRenewable(true);
        ucj.setData(renewable);
        ucj.setIsInRenewablePeriod(true);

        userCapabilityJunctionDAO.put(ucj);
        
      `
    }
  ]
});
