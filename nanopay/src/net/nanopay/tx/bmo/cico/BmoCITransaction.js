foam.CLASS({
  package: 'net.nanopay.tx.bmo.cico',
  name: 'BmoCITransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  implements: [
    'net.nanopay.tx.bmo.cico.BmoTransaction'
  ],

  properties: [
    {
      name: 'bmoReferenceNumber',
      class: 'String'
    },
    {
      name: 'bmoFileCreationNumber',
      class: 'Int'
    },
    {
      name: 'rejectReason',
      class: 'String'
    },
    {
      name: 'institutionNumber',
      class: 'String',
      value: '001',
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
        if ( other instanceof BmoCITransaction ) {
          setBmoReferenceNumber( ((BmoCITransaction) other).getBmoReferenceNumber() );
          setBmoFileCreationNumber( ((BmoCITransaction) other).getBmoFileCreationNumber() );
          setRejectReason( ((BmoCITransaction) other).getRejectReason() );
          setSettled( ((BmoCITransaction) other).getSettled() );
        }
      `
    }
  ]
});
