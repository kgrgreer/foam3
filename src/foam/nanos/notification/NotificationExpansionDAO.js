/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationExpansionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Expands a notification from a group or broadcast notification to a user specific notification.`,

  imports: [
    'notificationTemplateDAO'
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.dao.Sink',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Sequence',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.Subject',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Logger logger = Loggers.logger(x, this);
        DAO userDAO = (DAO) x.get("localUserDAO");
        Notification notif = (Notification) obj;

        if ( notif.getBroadcasted() ) {
          Notification notification = (Notification) notif.fclone();
          Notification.ID.clear(notification);
          Notification.GROUP_ID.clear(notification);
          Notification.TEMPLATE.clear(notification);
          notification.setBroadcasted(false);
          userDAO.where(
            AND(
              EQ(User.LIFECYCLE_STATE, LifecycleState.ACTIVE),
              HAS(User.GROUP)
          )).select(new AbstractSink() {
            @Override
            public void put(Object o, Detachable d) {
              User user = (User) o;
              user.doNotify(x, notification);
            }
          });
        } else if ( Notification.GROUP_ID.isSet(notif) ) {
          Group group = (Group) ((DAO) x.get("groupDAO")).find(notif.getGroupId());
          if ( group == null ) {
            logger.info("WARN,Notification group not found", notif.getGroupId(), notif);
            return obj;
          }
          if ( ! group.getEnabled() ) {
            logger.debug("Notification group disabled", notif.getGroupId(), notif);
            return obj;
          }
          Notification notification = (Notification) notif.fclone();
          Notification.ID.clear(notification);
          Notification.GROUP_ID.clear(notification);
          Notification.TEMPLATE.clear(notification);
          notification.setBroadcasted(false);
          Count count = new Count();
          Sequence seq = new Sequence.Builder(x)
            .setArgs(new Sink[] {
              count,
              new AbstractSink() {
                @Override
                public void put(Object o, Detachable d) {
                  User user = (User) o;
                  user.doNotify(x, notification);
                }
              }
            })
            .build();
          userDAO.where(
            AND(
              EQ(User.GROUP, notif.getGroupId()),
              EQ(User.LIFECYCLE_STATE, LifecycleState.ACTIVE)
          )).select(seq);
          if ( count.getValue() == 0 ) {
            logger.info("WARN,Notification group empty", notif);
          }
        } else if ( notif.getUserId() > 0 ) {
          User user = notif.findUserId(x);
          if ( ! Notification.SPID.isSet(notif) ) {
            notif.setSpid(user.getSpid());
          }
          if ( user.getLifecycleState() == LifecycleState.ACTIVE ) {
            user.doNotify(x, notif);
          } else {
            logger.info("WARN,Notification user not active", notif);
          }
        } else {
          logger.info("WARN,Notification not saved", notif);
        }
        return notif;
      `
    }
  ]
});
