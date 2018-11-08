foam.ENUM({
  package: 'net.nanopay.invoice.model',
  name: 'PaymentStatus',

  documentation: 'Keeps track of the payment state of an invoice.',

  values: [
    {
      name: 'NONE',
      documentation: 'The invoice has not been paid yet.',
      label: 'None'
    },
    {
      name: 'NANOPAY',
      documentation: 'The invoice has been paid using the nanopay platform.',
      label: 'paid'
    },
    {
      name: 'CHEQUE',
      documentation: 'The invoice has been paid.',
      label: 'Paid'
    },
    {
      name: 'VOID',
      documentation: 'The invoice has been voided.',
      label: 'Void'
    },
    {
      name: 'PENDING',
      documentation: `
        The invoice has been paid, but that payment hasn't been confirmed yet.
      `,
      label: 'Pending'
    },
    {
      name: 'TRANSIT_PAYMENT',
      documentation: `
        The invoice has been paid but will go through a holding account, CI to holding has not completed.
      `,
      label: 'Transit payment'
    },
    {
      name: 'DEPOSIT_PAYMENT',
      documentation: `
        The invoice has been paid, but the payment is sent to a holding account (Payer's default digitalAccount). 
        This is used in two cases:
        1) when paying an invoice where the payee is a contact, meaning the
        real user hasn't signed up yet. 
        2) when paying an invoice where the payee is a User, but User has not added
        a BankAccount, yet.
      `,
      label: 'Deposit payment'
    },
    {
      name: 'DEPOSIT_MONEY',
      documentation: `
        The invoice has been paid, but the payment is in a holding account (Payer's default digitalAccount). 
        This status is set when a transaction is moving to payee's actual BankAccount.
      `,
      label: 'Deposit money'
    },
    {
      name: 'PENDING_APPROVAL',
      documentation: `
        Someone who didn't have permission to pay this invoice tried to pay it,
        which put it in this state. It now needs to be paid by someone who has
        permission to pay it.
      `,
      label: 'Pending approval'
    }
  ]
});

