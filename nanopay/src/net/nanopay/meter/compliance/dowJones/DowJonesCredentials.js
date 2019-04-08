foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJonesCredentials',

  axioms: [foam.pattern.Singleton.create()],

  properties: [
    {
      class: 'String',
      name: 'username'
    },
    {
      class: 'String',
      name: 'password'
    },
    {
      class: 'String',
      name: 'namespace'
    },
    {
      class: 'String',
      name: 'baseUrl'
    }
  ]
});
