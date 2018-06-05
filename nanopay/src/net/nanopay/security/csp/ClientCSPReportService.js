foam.CLASS({
  package: 'net.nanopay.security.csp',
  name: 'ClientCSPReportService',

  implements: [
    'net.nanopay.security.csp.CSPReporter'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.security.csp.CSPReporter',
      name: 'delegate'
    }
  ]
});
