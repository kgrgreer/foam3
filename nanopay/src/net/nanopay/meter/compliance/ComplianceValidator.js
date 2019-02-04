foam.INTERFACE({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceValidator',

  methods: [
    {
      name: 'canValidate',
      type: 'Boolean',
      args: [
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'validate',
      type: 'net.nanopay.meter.compliance.ComplianceValidationStatus',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ]
    }
  ]
});