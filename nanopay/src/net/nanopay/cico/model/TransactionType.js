foam.ENUM({
  package: 'net.nanopay.cico.model',
  name: 'TransactionType',

  documentation: 'Types for CICO transactions',

  values: [
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
    }
  ]
});