foam.ENUM({
  package: 'net.nanopay.cico.model',
  name: 'TransactionType',

  documentation: 'Types for CICO transactions',

  values: [
    {
      name: 'NONE',
      label: 'None'
    },
    {
      name: 'CASHOUT',
      label: 'Cash Out'
    },
    {
      name: 'CASHIN',
      label: 'Cash In'
    },
    {
      name: 'VERIFICATION',
      label: 'Verification'
    },
    {
      // REVIEW - how is this used? - Joel
      name: 'BANK_ACCOUNT_PAYMENT',
      label: 'BankAccountPayment'
    },
    {
      documentation: 'This is used to process a refund from a merchant to a mint chip user. The flow for this is currently not implemented.',
      name: 'REFUND',
      label: 'Refund'
    },
    {
      name: 'REQUEST',
      label: 'Request'
    }
  ]
});
