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
      color: '$success700',
      background: '$success50',
    },
    {
      name: 'FAILED',
      label: 'Failed',
      color: '$destructive500',
      background: '$destructive50',
    },
    {
      name: 'BOUNCED',
      label: 'Bounced',
      color: '$warn500',
      background: '$warn700',
    },
    {
      name: 'RECEIVED',
      label: 'Received',
      color: '$blue500',
      background: '$grey50',
    },
    {
      name: 'PROCESSED',
      label: 'Processed',
      color: '$success700',
      background: '$success50',
    }
  ]
});
