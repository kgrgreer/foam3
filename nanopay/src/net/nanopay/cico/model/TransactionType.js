foam.ENUM({
  package: 'net.nanopay.cico.model',
  name: 'TransactionType',

  documentation: 'Types for CICO transactions',

  values: [
    {
      name: 'TX',
      label: 'tx'
    },
    {
      name: 'VERIFICATION',
      label: 'Verification'
    }
  ]
});