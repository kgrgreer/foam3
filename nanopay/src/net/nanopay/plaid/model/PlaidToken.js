foam.CLASS({
  package: 'net.nanopay.plaid.model',
  name: 'PlaidToken',

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
      class: 'String',
      name: 'accessToken'
    },
    {
      class: 'String',
      name: 'itemId',
      documentation: `
        The plaid item id.
        Please see https://plaid.com/docs/quickstart/#item-creation-flow`
    }
  ]
});
