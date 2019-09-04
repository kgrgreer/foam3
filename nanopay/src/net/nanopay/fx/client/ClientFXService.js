foam.CLASS({
  package: 'net.nanopay.fx.client',
  name: 'ClientFXService',

  implements: [
    'net.nanopay.fx.FXService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.fx.FXService',
      name: 'delegate'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.fx.client',
  name: 'CachedFXService',
  extends: 'net.nanopay.fx.ProxyFXService',
  properties: [
    {
      class: 'RequestResponseCache',
      of: 'net.nanopay.fx.FXService',
      name: 'cache',
      methods: ['getFXRate']
    },
    {
      class: 'Int',
      name: 'ttl',
      value: 5000
    }
  ]
});