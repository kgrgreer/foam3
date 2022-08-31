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
      color: '/*%APPROVAL1%*/ #04612E',
      background: '/*%APPROVAL5%*/ #EEF7ED',
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
      color: '/*%WARNING2%*/ #D57D11',
      background: '/*%WARNING5%*/ #FFF4DE',
    },
    {
      name: 'RECEIVED',
      label: 'Received',
      color: '/*%APPROVAL1%*/ #04612E',
      background: '/*%APPROVAL5%*/ #EEF7ED',
    }
  ]
});
