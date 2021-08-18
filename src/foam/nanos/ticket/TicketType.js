/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
  package: 'foam.nanos.ticket',
  name: 'TicketType',

  documentation: 'Types of Ticket',

  values: [
    {
      name: 'ONBOARDING_INQUIRY',
      label: 'Onboarding inquiry'
    },
    {
      name: 'PAYMENT_INQUIRY',
      label: 'Payment inquiry'
    },
    {
      name: 'PAYMENT_CANCELLATION',
      label: 'Payment cancellation'
    },
    {
      name: 'PAYMENT_DISPUTE',
      label: 'Payment / fee / charge dispute'
    },
    {
      name: 'FEEDBACK',
      label: 'Feedback / Complaints / Feature Request'
    },
    {
      name: 'ACCOUNT_INQUIRY',
      label: 'Account inquiry'
    },
    {
      name: 'LEGAL_INQUIRY',
      label: 'Privacy / Legal inquiry'
    }
  ]
});
