foam.CLASS({
  package: 'net.nanopay.plaid.model',
  name: 'PlaidItem',

  documentation: `
    Plaid access token and item id.
    Please see: https://plaid.com/docs/#exchange-token-flow
                https://plaid.com/docs/quickstart/#item-creation-flow`,

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'String',
      name: 'accessToken'
    },
    {
      class: 'String',
      name: 'itemId'
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
      class: 'Boolean',
      name: 'loginRequired'
    }
  ]
});
