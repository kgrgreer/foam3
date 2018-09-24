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
      documentation: 'The invoice has been paid, but that payment hasn\'t been confirmed yet.',
      label: 'Pending'
    },
    {
      name: 'HOLDING',
      documentation: `The invoice has been paid, but the payment is in Holding account.
      This is used when sending a system external User funds.`,
      label: 'Holding'
    },
    {
      name: 'CANCEL',
      documentation: `Payment on invoice has been Canceled. 
      Cancel is currently only possible with Holding accounts.
      This is a temporary status that is used to trigger a cancel transaction 
      from a Holding account - cancelling done in CancelHoldingDAO decorator on invoiceDAO.
      Note: Once Transaction for transfering funds is completed
      invoice.getPaymentMethod() == PaymentStatus.NONE `,
      label: 'Cancel'
    }
  ]
});

