foam.CLASS({
  package: 'net.nanopay.plaid.model',
  name: 'PlaidPublicToken',

  documentation: `The public token we use to exchange the access token`,

  properties: [
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'String',
      name: 'publicToken'
    },
    {
      class: 'String',
      name: 'institutionName'
    },
    {
      class: 'String',
      name: 'institutionId'
    },
    {
      class: 'Map',
      name: 'selectedAccount'
    },
    {
      class: 'Boolean',
      name: 'isUpdateMode'
    }
  ]
});
