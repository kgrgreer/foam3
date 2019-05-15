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
          name: 'firstName',
          type: 'String'
        },
        {
          name: 'surName',
          type: 'String'
        },
        {
          name: 'filterLRDFrom',
          type: 'Date'
        },
        {
          name: 'dateOfBirth',
          type: 'Date'
        },
        {
          name: 'filterRegion',
          type: 'String'
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
          name: 'entityName',
          type: 'String'
        },
        {
          name: 'filterLRDFrom',
          type: 'Date'
        },
        {
          name: 'filterRegion',
          type: 'String'
        }
      ]
    }
  ]
});
