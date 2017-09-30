foam.ENUM({
  package: 'net.nanopay.cico.model',
  name: 'TransactionType',

  documentation: 'Types for CICO transactions',

  values: [
    {
      name: 'CASHIN',
      label: 'Cash In'
    },
    {
      name: 'CASHOUT',
      label: 'Cash Out'
    },
    {
      name: 'VERIFICATION',
      label: 'Verification'
    }
  ]
});