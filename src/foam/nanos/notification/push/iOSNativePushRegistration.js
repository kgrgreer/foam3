/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'iOSNativePushRegistration',
  extends: 'foam.nanos.notification.push.PushRegistration',
  documentation: 'APNS device token model for push registration',

  properties: [
    {
      name: 'key',
      hidden: true
    },
    {
      name: 'auth',
      hidden: true
    }
  ]
});