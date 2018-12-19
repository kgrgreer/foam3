foam.CLASS({
  package: 'net.nanopay.plaid.model',
  name: 'PlaidWebhook',

  documentation: ``,

  properties: [
    {
      class: 'String',
      name: 'webhook_type'
    },
    {
      class: 'String',
      name: 'webhook_code'
    },
    {
      class: 'String',
      name: 'item_id'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.PlaidError',
      name: 'error'
    }
  ]
});
