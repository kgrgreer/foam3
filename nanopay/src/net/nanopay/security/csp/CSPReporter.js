foam.INTERFACE({
  package: 'net.nanopay.security.csp',
  name: 'CSPReporter',

  methods: [
    {
      name: 'processReport',
      javaReturns: 'boolean',
      returns: 'Promise',

      args: [
        {
          class: 'FObjectProperty',
          of: 'net.nanopay.security.csp.CSPViolationReport',
          name: 'violationReport',
          javaType: 'net.nanopay.security.csp.CSPViolationReport'
        }
      ]
    }
  ]
});
