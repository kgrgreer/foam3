foam.CLASS({
  package: 'net.nanopay.tx.rbc',
  name: 'RbcCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  properties: [
    {
      name: 'rbcReferenceNumber',
      class: 'String'
    },
    {
      name: 'rbcFileCreationNumber',
      class: 'Int'
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
