foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'EFTReturnRecord',

  properties: [
    {
      class: 'Int',
      name: 'transactionID',
    },
    {
      class: 'String',
      name: 'externalReference'
    },
    {
      class: 'String',
      name: 'returnCode'
    },
    {
      class: 'String',
      name: 'returnDate'
    },
    {
      class: 'String',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'account'
    },
    {
      class: 'String',
      name: 'bankNumber'
    },
    {
      class: 'String',
      name: 'transitNumber'
    }
  ]
});
