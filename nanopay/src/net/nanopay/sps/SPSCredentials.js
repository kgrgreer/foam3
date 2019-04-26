foam.CLASS({
  package: 'net.nanopay.sps',
  name: 'SPSCredentials',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    {
      class: 'String',
      name: 'url'
    },
    {
      class: 'String',
      name: 'host'
    },
    {
      class: 'String',
      name: 'user'
    },
    {
      class: 'String',
      name: 'password'
    },
    {
      class: 'Int',
      name: 'port'
    }
  ]
});
