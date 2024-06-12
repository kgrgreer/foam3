/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'APNSPushService',

  documentation: `Not called directly, rather called through WebPushService`,

  implements: [
    'foam.nanos.notification.push.PushService'
  ],

  javaImports: [
    'java.security.Security',
    'foam.dao.*',
    'foam.dao.ArraySink',
    'foam.nanos.auth.*',
    'java.util.List'
  ],

  properties: [
    
  ],

  methods: [
    {
      name: 'sendPushById',
      javaCode:
      `
        //NO-OP
        return false;
      `
    },
    {
      name: 'sendPush',
      javaCode:
      `
        //NO-OP
        return false;
      `
    },
    {
      name: 'send',
      args: 'iOSNativePushRegistration sub, String msg',
      type: 'Void',
      javaCode: `
        try {
          System.err.println("****APNS CALLED, msg");
          // Contact APNS and request a notification
        } catch (Throwable t) {
          throw t;
        }
      `
    }
  ]
});
