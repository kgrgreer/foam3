foam.INTERFACE({
  package: 'net.nanopay.meter.compliance',
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
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'record',
          javaType: 'net.nanopay.meter.compliance.ComplianceHistory'
        }
      ]
    }
  ]
});