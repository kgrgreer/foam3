foam.CLASS({
  package: 'net.nanopay.tx.bmo.cico',
  name: 'BmoCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  javaImports: [
    'java.util.ArrayList',
    'java.util.Arrays',
    'net.nanopay.tx.bmo.BmoFormatUtil',
    'net.nanopay.tx.bmo.BmoTransactionHistory',
    'foam.core.FObject',
    'java.util.List'
  ],

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
        setBmoReferenceNumber( ((BmoCOTransaction) other).getBmoReferenceNumber() );
        setBmoFileCreationNumber( ((BmoCOTransaction) other).getBmoFileCreationNumber() );
        setRejectReason( ((BmoCOTransaction) other).getRejectReason() );
        setSettled( ((BmoCOTransaction) other).getSettled() );
      `
    }
  ]
});
