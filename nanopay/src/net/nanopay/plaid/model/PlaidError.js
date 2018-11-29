foam.CLASS({
  package: 'net.nanopay.plaid.model',
  name: 'PlaidError',

  documentation: ``,

  properties: [
    {
      class: 'String',
      name: 'error_code'
    },
    {
      class: 'String',
      name: 'error_type'
    },
    {
      class: 'String',
      name: 'error_message'
    },
    {
      class: 'String',
      name: 'display_message'
    }
  ]
});
