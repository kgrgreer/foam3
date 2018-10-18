foam.CLASS({
  package:  'net.nanopay.integration.quick.model',
  name: 'QuickQueryResponse',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickInvoices',
      name: 'QueryResponse'
    },
    {
      class: 'Date',
      name: 'time'
    }
  ]
});
