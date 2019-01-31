foam.INTERFACE({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceValidator',

  methods: [
    {
      name: 'canValidate',
      javaReturns: 'boolean',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'validate',
      javaReturns: 'net.nanopay.meter.compliance.ComplianceValidationStatus',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    }
  ]
});