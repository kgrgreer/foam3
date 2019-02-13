foam.INTERFACE({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceService',

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'entity',
          type: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'record',
          type: 'net.nanopay.meter.compliance.ComplianceHistory'
        }
      ]
    }
  ]
});