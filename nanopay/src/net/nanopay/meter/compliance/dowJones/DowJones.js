foam.INTERFACE({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJones',

  methods: [
    {
      name: 'personNameSearch',
      type: 'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
      async: true,
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'searchData',
          type: 'net.nanopay.meter.compliance.dowJones.PersonNameSearchData'
        }
      ]
    },
    {
      name: 'entityNameSearch',
      type: 'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
      async: true,
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'searchData',
          type: 'net.nanopay.meter.compliance.dowJones.EntityNameSearchData'
        }
      ]
    }
  ]
});
