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

  methods: [
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          type: 'net.nanopay.tx.model.Transaction'
        },
      ],
      javaCode: `
        super.limitedCopyFrom(other);
        setRbcReferenceNumber( ((RbcCITransaction) other).getRbcReferenceNumber() );
        setRbcFileCreationNumber( ((RbcCITransaction) other).getRbcFileCreationNumber() );
        setRejectReason( ((RbcCITransaction) other).getRejectReason() );
        setSettled( ((RbcCITransaction) other).getSettled() );
      `
    }
  ]
});
