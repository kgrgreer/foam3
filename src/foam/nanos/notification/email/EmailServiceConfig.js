/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailServiceConfig',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      value: 'default'
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: false
    },
    {
      name: 'host',
      class: 'String',
      value: '127.0.0.1'
    },
    {
      name: 'port',
      class: 'String',
      value: '587'
    },
    {
      name: 'username',
      class: 'String',
      value: null
    },
    {
      name: 'password',
      class: 'String',
      value: null
    },
    {
      name: 'authenticate',
      class: 'Boolean',
      value: true
    },
    {
      name: 'starttls',
      class: 'Boolean',
      value: true
    },
    {
      name: 'protocol',
      class: 'String',
      value: 'smtp'
    },
    {
      documentation: 'Relevant to send - Provider imposed rateLimit (per second), at which point they will throttle or block completely for some time window',
      name: 'rateLimit',
      class: 'Long',
      units: 's',
      value: 14 // default for smtp.gmail.com
    },
    {
      name: 'predicate',
      class: 'foam.mlang.predicate.PredicateProperty',
      factory: function () {
        return foam.mlang.MLang.EQ(EmailMessage.STATUS, Status.UNSENT);
      },
      javaFactory: `
        return foam.mlang.MLang.EQ(EmailMessage.STATUS, Status.UNSENT);
      `,
      visibility: 'RO' // default display is to verbose
    },
    {
      name: 'emailMessageSendDAOKey',
      class: 'String',
      value: 'emailMessageDAO'
    },
    {
      documentation: 'Relevant to fetch/receive',
      name: 'folderName',
      class: 'String',
      value: 'INBOX'
    },
    {
      name: 'processAttachments',
      class: 'Boolean',
      value: true
    },
    {
      documentation: 'Relevant to fetch/receive - delete remote email after receive.',
      name: 'delete',
      class: 'Boolean',
      value: true
    },
    {
      name: 'emailMessageReceiveDAOKey',
      class: 'String',
      value: 'emailMessageReceivedDAO'
    },
    {
      name: 'pollInterval',
      class: 'Long',
      value: 10000
    },
    {
      name: 'initialDelay',
      class: 'Int',
      value: 60000
    }
  ]
});
