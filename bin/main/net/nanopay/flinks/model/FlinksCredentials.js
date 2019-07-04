foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksCredentials',

  axioms: [foam.pattern.Singleton.create()],

  properties: [
    {
      class: 'String',
      name: 'url'
    },
    {
      class: 'String',
      name: 'customerId'
    }
  ]
});
