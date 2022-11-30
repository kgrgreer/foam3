/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationGoogleChatRefines',
  refines: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'String',
      name: 'googleChatWebhook',
      documentation: 'Webhook associated to GoogleChat.'
    },
    {
      class: 'String',
      name: 'googleChatMessage',
      documentation: 'Message to be sent to GoogleChat.'
    }
  ]
});
