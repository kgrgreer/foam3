foam.INTERFACE({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJonesSearch',

  methods: [
    {
      name: 'nameSearch',
      type: 'net.nanopay.meter.compliance.dowJones.BaseSearchResponse',
      async: true,
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'personNameSearch',
      type: 'net.nanopay.meter.compliance.dowJones.BaseSearchResponse',
      async: true,
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'entityNameSearch',
      type: 'net.nanopay.meter.compliance.dowJones.BaseSearchResponse',
      async: true,
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'idTypeSearch',
      type: 'net.nanopay.meter.compliance.dowJones.BaseSearchResponse',
      async: true,
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});
