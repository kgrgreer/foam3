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
