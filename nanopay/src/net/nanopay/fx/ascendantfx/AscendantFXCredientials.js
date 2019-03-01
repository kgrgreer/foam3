foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXCredientials',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    {
      class: 'String',
      name: 'user'
    },
    {
      class: 'String',
      name: 'password'
    },
    {
      class: 'String',
      name: 'host'
    }
  ]
});
