foam.INTERFACE({
  package: 'net.nanopay.meter',
  name: 'ComplianceService',

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'entity',
          javaType: 'foam.core.FObject'
        }
      ]
    }
  ]
});