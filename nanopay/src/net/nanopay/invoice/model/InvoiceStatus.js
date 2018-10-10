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
        name: 'DUE',
        documentation: 'The invoice is due.',
        label: 'Due'
      },
      {
        name: 'PAID',
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
        name: 'PENDING_ACCEPTANCE',
        documentation: 'The invoice has been paid by moving money into a User owned holding account, and is pending payee acceptance of transfer.',
        label: 'PendingAcceptance'
      },
      {
        name: 'DRAFT',
        documentation: 'The invoice is a draft.',
        label: 'Draft'
      }
    ]
  });