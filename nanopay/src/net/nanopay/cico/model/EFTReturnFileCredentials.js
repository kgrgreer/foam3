foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'EFTReturnFileCredentials',

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
    },
    {
      class: 'Int',
      name: 'port'
    },
    {
      class: 'String',
      name: 'identifier'
    }
  ]
});
