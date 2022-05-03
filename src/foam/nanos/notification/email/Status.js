/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.notification.email',
  name: 'Status',

  documentation: `
    Status of an email message.
  `,

  properties: [
    {
      class: 'String',
      name: 'errorMessage'
    }
  ],

  values: [
    {
      name: 'DRAFT',
      label: 'Draft',
      color: '$grey700',
      background: '$grey50',
    },
    {
      name: 'UNSENT',
      label: 'Unsent',
      color: '$grey700',
      background: '$grey50',
    },
    {
      name: 'SENT',
      label: 'Sent',
      color: '$green700',
      background: '$green50',
    },
    {
      name: 'FAILED',
      label: 'Failed',
      color: '$red500',
      background: '$red700',
    },
    {
      name: 'BOUNCED',
      label: 'Bounced',
      color: '$yellow500',
      background: '$yellow50',
    },
    {
      name: 'RECEIVED',
      label: 'Received',
      color: '$green700',
      background: '$green50',
    }
  ]
});
