foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ProxyTransaction',
  //implements: [ 'net.nanopay.tx.Logger' ],

  documentation: '',

  properties: [
    {
      class: 'Proxy',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'delegate'
    }
  ]
});
