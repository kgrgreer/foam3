/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'NotificationPushRefines',
  refines: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'Boolean',
      name: 'pushEnabled',
      documentation: 'Determines if notification should be delivered as a push notification.'
    }
  ]
});
