foam.CLASS({
  package: 'net.nanopay.tx.bmo',
  name: 'BmoReferenceNumber',

  properties: [
    {
      name: 'id',
      class: 'Long',
      documentation: 'the reference number we will send to BMO'
    },
    {
      name: 'transactionId',
      class: 'String'
    }
  ]

});
