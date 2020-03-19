foam.CLASS({
  package: 'net.nanopay.tx.rbc',
  name: 'RbcVerificationTransaction',
  extends: 'net.nanopay.tx.cico.VerificationTransaction',

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
      name: 'settled',
      class: 'Boolean'
    }
  ],

});
