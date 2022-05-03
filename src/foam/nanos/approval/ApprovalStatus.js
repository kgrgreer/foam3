/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
  package: 'foam.nanos.approval',
  name: 'ApprovalStatus',

  values: [
    {
      name: 'REQUESTED',
      label: { en: 'Requested', pt: 'Requeridos'},
      ordinal: 0,
      documentation: 'Request pending.',
      color: '$yellow500',
      background: '$yellow50',
    },
    {
      name: 'APPROVED',
      label: { en: 'Approved', pt: 'Aprovado'},
      ordinal: 1,
      documentation: 'Request was approved.',
      color: '$green700',
      background: '$green50',
    },
    {
      name: 'REJECTED',
      label: { en: 'Rejected', pt: 'Rejeitado'},
      ordinal: 2,
      documentation: 'Request was rejected.',
      color: '$red500',
      background: '$red700',
    },
    {
      name: 'CANCELLED',
      label: { en: 'Cancelled', pt: 'Cancelado'},
      ordinal: 3,
      documentation: 'Request was cancelled.',
      color: '$grey700',
      background: '$grey50',
    }
  ]
});
