/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.notification.push',
  name: 'PushService',

  // TODO: remove client and skeleton before production
  client:   true,
  proxy:    true,
  skeleton: true,

  methods: [
    {
      name: 'sendPush',
      async: true,
      type: 'Boolean',
      args: [
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'msg',
          type: 'String'
        },
        {
          name: 'data',
          type: 'Map'
        }
      ]
    },
    {
      name: 'sendPushById',
      async: true,
      type: 'Boolean',
      args: [
        {
          name: 'id',
          type: 'Long'
        },
        {
          name: 'msg',
          type: 'String'
        },
        {
          name: 'data',
          type: 'Map'
        }
      ]
    }
  ]
});
