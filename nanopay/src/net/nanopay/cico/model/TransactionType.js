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
      name: 'BANK_ACCOUNT_PAYMENT',
      label: 'BankAccountPayment'
    }
  ]
});