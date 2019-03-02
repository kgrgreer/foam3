foam.ENUM({
    package: 'net.nanopay.invoice.model',
    name: 'InvoiceStatus',
  
    documentation: 'State of an invoice.',
  
    values: [
      {
        name: 'SCHEDULED',
        documentation: 'The invoice has a scheduled due date, and has not been paid yet.',
        label: 'Scheduled'
      },
      {
        name: 'OVERDUE',
        documentation: 'The invoice has a passed due date, and has not been paid yet.',
        label: 'Overdue'
      },
      {
        name: 'UNPAID',
        documentation: 'The invoice is unpaid.',
        label: 'Unpaid'
      },
      {
        name: 'PAID',
        documentation: 'The invoice has been paid.',
        label: 'Complete'
      },
      {
        name: 'VOID',
        documentation: 'The invoice has been voided.',
        label: 'Void'
      },
      {
        name: 'PENDING',
        documentation: 'The invoice has been paid, but that payment is still in processing.',
        label: 'Processing'
      },
      {
        name: 'PENDING_ACCEPTANCE',
        documentation: `The invoice has been paid by moving money into payer owned 
        holding account(default DigitalAccount), and is pending payee acceptance of transfer.`,
        label: 'Pending acceptance'
      },
      {
        name: 'DEPOSITING_MONEY',
        documentation: `The invoice has been paid by moving money into payer owned 
        holding account(default DigitalAccount), and is now moving to payee's BankAccount.`,
        label: 'Depositing money'
      },
      {
        name: 'DRAFT',
        documentation: 'The invoice is a draft.',
        label: 'Draft'
      },
      {
        name: 'PENDING_APPROVAL',
        documentation: 'The invoice still needs to be approved and paid.',
        label: 'Pending approval'
      }
    ]
  });
