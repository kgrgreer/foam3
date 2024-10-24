
/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationSetting',
  label: 'In-App Notification Setting',

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.ServiceProviderAwareSupport',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.util.Auth',
    'java.util.HashSet'
  ],

  tableColumns: [
    'id',
    'enabled',
    'type',
    'spid'
  ],

  messages: [
    {
      name: 'LACKS_CREATE_PERMISSION',
      message: 'You don\'t have permission to create this notification setting'
    },
    {
      name: 'LACKS_UPDATE_PERMISSION',
      message: 'You don\'t have permission to update notification settings you do not own'
    },
    {
      name: 'LACKS_DELETE_PERMISSION',
      message: 'You don\'t have permission to delete notification settings you do not own'
    },
    {
      name: 'LACKS_READ_PERMISSION',
      message: 'You don\'t have permission to read notification settings you do not own'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'String',
      name: 'type',
      documentation: 'Notification settings are identified by their class, this property exposes that in UI.',
      visibility: 'RO',
      transient: true,
      getter: function() {
        return this.cls_.nane;
      },
      javaGetter: `
        return getClass().getSimpleName();
      `
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      javaFactory: `
        var spidMap = new java.util.HashMap();
        spidMap.put(
          NotificationSetting.class.getName(),
          new foam.core.PropertyInfo[] { NotificationSetting.OWNER }
        );
        return new ServiceProviderAwareSupport()
          .findSpid(foam.core.XLocator.get(), spidMap, this);
      `
    }
  ],

  methods: [
    {
      name: 'doNotify',
      args: [
        { name: 'x',            type: 'Context' },
        { name: 'user',         type: 'foam.nanos.auth.User' },
        { name: 'notification', type: 'foam.nanos.notification.Notification' }
      ],
      javaCode: `
        X userX = x;
        Subject subject = (Subject) x.get("subject");
        if ( subject.getRealUser().getId() != user.getId() ) {
          userX = Auth.sudo(x, user);
        }
        // Proxy to sendNotification method
        sendNotification(userX, user, notification);
      `
    },
    {
      name: 'sendNotification',
      args: [
        { name: 'x',            type: 'Context' },
        { name: 'user',         type: 'foam.nanos.auth.User' },
        { name: 'notification', type: 'foam.nanos.notification.Notification' }
      ],
      javaCode: `
        notification = (Notification) notification.fclone();
        notification.setUserId(user.getId());
        notification.clearGroupId();
        notification.setBroadcasted(false);

        // We cannot permanently disable in-app notifications, so mark them read automatically
        if ( ! getEnabled() ) {
          notification.setRead(true);
        } else if ( user.getDisabledTopicSet() != null ) {
          HashSet<String> disabledTopicsSet = (HashSet<String>) user.getDisabledTopicSet();
          if ( disabledTopicsSet.contains(notification.getNotificationType()) ) {
            notification.setRead(true);
          }
        }

        try {
          ((DAO) x.get("localNotificationDAO")).put(notification);
        } catch (Throwable t) {
          Loggers.logger(x, this).error("Failed to send notification", t.getMessage(), t);
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkSpid(x) &&
           ! checkOwnership(x) &&
           ! auth.check(x, "notificationsetting.create") )
        throw new AuthorizationException(LACKS_CREATE_PERMISSION);
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkSpid(x) &&
           ! checkOwnership(x) &&
           ! auth.check(x, createPermission("update")) )
        throw new AuthorizationException(LACKS_UPDATE_PERMISSION);
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkSpid(x) &&
           ! checkOwnership(x) &&
           ! auth.check(x, createPermission("remove")) )
        throw new AuthorizationException(LACKS_DELETE_PERMISSION);
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkSpid(x) &&
           ! checkOwnership(x) &&
           ! auth.check(x, createPermission("read")) )
        throw new AuthorizationException(LACKS_READ_PERMISSION);
      `
    },
    {
      name: 'checkOwnership',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Boolean',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();

        if ( user == null ) return false;
        return getUserJunction() != null && ( getUserJunction().getTargetId() == user.getId() ) || getOwner() == user.getId();
      `
    },
    {
      name: 'checkSpid',
      documentation: `Allow user to access global spid defaults
        NOTE: should not circumvent permission and ownership checks
      `,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Boolean',
      javaCode: `
        if ( isGlobalSpid() )
          return true;
        return ((String) x.get("spid")) == getSpid();
      `
    },
    {
      name: 'createPermission',
      args: [
        { name: 'operation', type: 'String' }
      ],
      type: 'String',
      javaCode: `
        return "notificationsetting." + operation + "." + getId();
      `
    }
  ]
});
