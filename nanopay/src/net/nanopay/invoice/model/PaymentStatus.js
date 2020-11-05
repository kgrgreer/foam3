/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.ENUM({
  package: 'net.nanopay.invoice.model',
  name: 'PaymentStatus',

  documentation: 'The base model for tracking the payment status of an invoice.',

  values: [
    {
      name: 'NONE',
      documentation: 'A status that indicates that the invoice has not been paid yet.',
      label: 'None'
    },
    {
      name: 'NANOPAY',
      documentation: `A status that indicates that the invoice has been paid using 
        the nanopay platform.`,
      label: 'paid'
    },
    {
      name: 'CHEQUE',
      documentation: 'A status that indicates that the invoice has been paid.',
      label: 'Paid'
    },
    {
      name: 'VOID',
      documentation: 'A status that indicates the invoice has been voided.',
      label: 'Void'
    },
    {
      name: 'PROCESSING',
      documentation: `A status that indicates the payment of the related invoice
        is in transit.
      `,
      label: 'Processing'
    },
    {
      name: 'TRANSIT_PAYMENT',
      documentation: `A status that indicates that the invoice has been paid 
        but will go through a holding account, CI to holding has not completed.
      `,
      label: 'Transit payment'
    },
    {
      name: 'DEPOSIT_PAYMENT',
      documentation: `A status that indicates that the invoice has been paid, 
        but the payment is sent to a holding account (Payer's default digitalAccount). 
        This is used in two cases: 
        1) when paying an invoice where the Payee is a Contact, an individual person 
        who is not registered with the platform.  
        2) when paying an invoice where the Payee is a User, but the User has yet to 
        add a BankAccount.
      `,
      label: 'Deposit payment'
    },
    {
      name: 'DEPOSIT_MONEY',
      documentation: `A status that indicates that the invoice has been paid, but the 
        payment is in a holding account (Payer's default digitalAccount). This status 
        is set when a transaction is moving to Payee's actual BankAccount.
      `,
      label: 'Deposit money'
    },
    {
      name: 'PENDING_APPROVAL',
      documentation: `A status that indicates that the invoice is in a pending state 
        because someone who didn't have permission to pay this invoice tried to pay it. 
        It now needs to be paid by someone who has permission to pay it.
      `,
      label: 'Pending approval'
    },
    {
      name: 'QUOTED',
      documentation: 'A status that indicates that the invoice is being used to create a quote for a transaction',
      label: 'Quote'
    },
    {
      name: 'SUBMIT',
      documentation: 'A status that indicates that the quoting invoice is ready to be submited as a transaction',
      label: 'Submit'
    },
    {
      name: 'REJECTED',
      documentation: 'A status that indicates the invoice has been rejected.',
      label: 'Rejected'
    }
  ]
});
