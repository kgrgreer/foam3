/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'PushRegistryService',
  implements: [ 'foam.nanos.notification.push.PushRegistry' ],

  methods: [
    {
      name: 'subscribe',
      type: 'Void',
      args: 'Context x, String sub',
      javaCode: `
        System.err.println("******************** REGISTER: " + sub);
      `
    }
  ]
});
