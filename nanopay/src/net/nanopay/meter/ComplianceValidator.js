foam.INTERFACE({
  package: 'net.nanopay.meter',
  name: 'ComplianceValidator',

  methods: [
    {
      name: 'canValidate',
      javaReturns: 'Boolean',
      args: [
        {
          name: 'entity',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'validate',
      args: [
        {
          name: 'entity',
          javaType: 'foam.core.FObject'
        }
      ]
    }
  ]
});