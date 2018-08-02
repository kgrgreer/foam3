foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ProxyTransaction',

  documentation: '',

  properties: [
    {
      class: 'Proxy',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'delegate'
    }
  ]
});
