foam.CLASS({
  package: 'net.nanopay.fx.client',
  name: 'ClientFXService',

  implements: [
    'net.nanopay.fx.FXServiceInterface'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.fx.FXServiceInterface',
      name: 'delegate'
    }
  ]
});
