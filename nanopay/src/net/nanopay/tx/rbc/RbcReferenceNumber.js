foam.CLASS({
  package: 'net.nanopay.tx.rbc',
  name: 'RbcReferenceNumber',

  properties: [
    {
      name: 'id',
      class: 'Long',
      documentation: 'the reference number we will send to RBC as EndToEndId'
    },
    {
      name: 'transactionId',
      class: 'String'
    }
  ]

});
