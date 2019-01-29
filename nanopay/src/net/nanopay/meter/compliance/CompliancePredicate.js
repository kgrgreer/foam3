foam.INTERFACE({
  package: 'net.nanopay.meter.compliance',
  name: 'CompliancePredicate',

  documentation: 'Compliance predicate interface.',

  methods: [
    {
      name: 'test',
      javaReturns: 'boolean',
      args: [
        {
          name: 'oldObj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'newObj',
          javaType: 'foam.core.FObject'
        }
      ]
    }
  ]
});