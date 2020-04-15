foam.CLASS({
  package: 'net.nanopay.tx.rbc',
  name: 'RbcVerificationTransaction',
  extends: 'net.nanopay.tx.cico.VerificationTransaction',

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
        if ( other instanceof RbcVerificationTransaction ) {
          setRbcReferenceNumber( ((RbcVerificationTransaction) other).getRbcReferenceNumber() );
          setRbcFileCreationNumber( ((RbcVerificationTransaction) other).getRbcFileCreationNumber() );
          setRejectReason( ((RbcVerificationTransaction) other).getRejectReason() );
          setSettled( ((RbcVerificationTransaction) other).getSettled() );
        }
      `
    }
  ]

});
