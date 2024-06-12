/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.notification.push',
  name: 'PushRegistry',

  client:   true,
  proxy:    true,
  skeleton: true,

  methods: [
    {
      name: 'subscribe',
      type: 'Void',
      args: 'Context x, String endpoint, String key, String auth, String token'
    }
  ]
});
