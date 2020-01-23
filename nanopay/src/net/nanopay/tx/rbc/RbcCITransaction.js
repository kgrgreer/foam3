foam.CLASS({
  package: 'net.nanopay.tx.rbc',
  name: 'RbcCITransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  implements: [
    'net.nanopay.tx.rbc.RbcTransaction'
  ],

  properties: [
    {
      name: 'rbcReferenceNumber',
      class: 'String'
    },
    {
      name: 'rbcFileCreationNumber',
      class: 'Long'
    },
    {
      name: 'rejectReason',
      class: 'String'
    },
    {
      name: 'institutionNumber',
      class: 'String',
      value: '003',
      visibility: 'Hidden'
    },
    {
      name: 'settled',
      class: 'Boolean'
    }
  ],
});
