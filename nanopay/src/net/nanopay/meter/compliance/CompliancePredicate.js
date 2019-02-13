foam.INTERFACE({
  package: 'net.nanopay.meter.compliance',
  name: 'CompliancePredicate',

  documentation: 'Compliance predicate interface.',

  methods: [
    {
      name: 'test',
      type: 'Boolean',
      args: [
        {
          name: 'oldObj',
          type: 'foam.core.FObject'
        },
        {
          name: 'newObj',
          type: 'foam.core.FObject'
        }
      ]
    }
  ]
});