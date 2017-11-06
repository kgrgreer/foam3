foam.ENUM({
  package: 'net.nanopay.tx.model',
  name: 'FeeType',

  documentation: 'Types for CICO transactions',

  values: [
    {
      name: 'NONE',
      label: 'None'
    },
    {
      name: 'SENDING',
      label: 'Sending Fee'
    },
    {
      name: 'RECEIVING',
      label: 'Receiving Fee'
    },
    {
      name: 'FX_MARGIN',
      label: 'FX Margin'
    },
    {
      name: 'INFORMATIONAL',
      label: 'Informational Fee'
    }
  ]
});