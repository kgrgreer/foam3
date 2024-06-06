/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// x.pushService.sendPushById(1348, 'foo', 'bar');

// n = foam.nanos.notification.Notification.create({userId:1348, enablePush: true, toastMessage: 'title', toastSubMessage: 'body'});
// x.notificationDAO.put(n);


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
          type: 'foam.nanos.auth.User',
          name: 'user'
        },
        {
          type: 'String',
          name: 'title'
        },
        {
          type: 'String',
          name: 'body'
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
          type: 'String',
          name: 'title'
        },
        {
          type: 'String',
          name: 'body'
        }
      ]
    }
  ]
});
