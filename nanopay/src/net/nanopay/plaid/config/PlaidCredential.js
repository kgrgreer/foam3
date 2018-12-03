foam.CLASS({
  package: 'net.nanopay.plaid.config',
  name: 'PlaidCredential',

  properties: [
    {
      class: 'String',
      name: 'env',
      documentation: 'Value could be sandbox, development, production'
    },
    {
      class: 'String',
      name: 'publicKey'
    },
    {
      class: 'String',
      name: 'clientId'
    },
    {
      class: 'String',
      name: 'clientName'
    },
    {
      class: 'String',
      name: 'secret'
    },
    {
      class: 'String',
      name: 'webhook'
    },
    {
      class: 'String',
      name: 'token'
    }
  ]
});
