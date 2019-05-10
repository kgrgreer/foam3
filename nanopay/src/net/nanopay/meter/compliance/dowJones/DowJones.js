foam.INTERFACE({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJones',

  methods: [
    {
      name: 'personNameSearch',
      type: 'net.nanopay.meter.compliance.dowJones.BaseSearchResponse',
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
          name: 'lastName',
          type: 'String'
        },
        {
          name: 'filterLRDFrom',
          type: 'Date'
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
        },
        {
          name: 'entityName',
          type: 'String'
        },
        {
          name: 'filterLRDFrom',
          type: 'Date'
        }
      ]
    }
  ]
});
