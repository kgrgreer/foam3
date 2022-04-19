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
    'foam.mlang.sink.Count',
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
        DAO          userDAO = (DAO) x.get("localUserDAO");
        Notification notif   = (Notification) obj;

        if ( notif.getBroadcasted() ) {
          userDAO.select(new AbstractSink() {
            @Override
            public void put(Object o, Detachable d) {
              User user = (User) o;
              user.doNotify(x, notif);
            }
          });
        } else if ( ! SafetyUtil.isEmpty(notif.getGroupId()) ) {
          Group group = (Group) ((DAO) x.get("groupDAO")).find(notif.getGroupId());
          if ( ! group.getEnabled() ) {
            Loggers.logger(x, this).debug(notif.getTemplate(), "group", "disabled");
            return obj;
          }
          DAO receivers = userDAO.where(
            AND(
              EQ(User.GROUP, notif.getGroupId()),
              EQ(User.LIFECYCLE_STATE, LifecycleState.ACTIVE)
          ));
          Count  count  = (Count) receivers.select(new Count());
          Logger logger = foam.nanos.logger.Loggers.logger(x, this);
          if ( count.getValue() == 0 ) {
            logger.warning("Notification " + notif.getNotificationType() +
              " will not be saved to notificationDAO because no users exist in the group " + notif.getGroupId());
          }
          receivers.select(new AbstractSink() {
            @Override
            public void put(Object o, Detachable d) {
              User user = (User) o;
              user.doNotify(x, notif);
            }
          });
        }

        // Only put objects sent to a specific user
        if ( SafetyUtil.isEmpty(notif.getGroupId()) &&
             ! notif.getBroadcasted() &&
             notif.getUserId() > 0 ) {
          Logger logger   = foam.nanos.logger.Loggers.logger(x, this);
          Subject subject = (Subject) x.get("subject");
          if ( subject != null ) {
            User user = subject.getUser();
            notif.setSpid(user.getSpid());
            if ( ! foam.util.SafetyUtil.isEmpty(notif.getSpid()) ) {
              try {
                return getDelegate().put_(x, notif);
              } catch ( Throwable t ) {
                logger.error(t);
              }
            }
          }
          logger.warning(notif.getNotificationType(), "Spid not found", "Notification not saved");
        }

        return obj;
      `
    }
  ]
});
