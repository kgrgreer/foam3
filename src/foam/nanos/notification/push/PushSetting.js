/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'PushSetting',
  extends: 'foam.nanos.notification.NotificationSetting',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.core.XLocator',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.notification.push.PushService'
  ],

  methods: [
    {
      name: 'sendNotification',
      javaCode: `
      try {
        if ( ! notification.getPushEnabled() )
          return;

        PushService pushService = (PushService) XLocator.get().get("pushService");
        String title = notification.getToastMessage();    // restricted to 30 chars
        String body  = notification.getToastSubMessage(); // restricted to 60 chars
        pushService.sendPush(user, title, body);
      } catch (Throwable t) {
        Loggers.logger(x, this).error(t);
      }
      `
    }
  ]
});
