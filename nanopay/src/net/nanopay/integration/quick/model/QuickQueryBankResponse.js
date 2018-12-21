foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryBankResponse',
  documentation: 'Class for Bank import from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickPutBank',
      name: 'QueryResponse'
    }
  ]
});
