foam.ENUM({
  package: 'net.nanopay.invoice.model',
  name: 'PaymentStatus',
  values: [
    {
      name: 'NONE',
      label: 'None'
    },
    {
      name: 'NANOPAY',
      label: 'Nanopaid'
    },
    {
      name: 'CHEQUE',
      label: 'Paid'
    },
    {
      name: 'VOID',
      label: 'Void'
    },
    {
      name: 'PENDING',
      label: 'Pending'
    }
  ]
});

