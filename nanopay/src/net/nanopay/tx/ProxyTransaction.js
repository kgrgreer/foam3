foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ProxyTransaction',

  documentation: '',

  properties: [
    {
      class: 'Proxy',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'delegate'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'parent'
    }
  ]
});
