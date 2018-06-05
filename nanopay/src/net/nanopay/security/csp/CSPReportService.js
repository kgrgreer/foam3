foam.CLASS({
  package: 'net.nanopay.security.csp',
  name: 'CSPReportService',

  documentation: `Service that fetches all of the incoming CSP Violation
    reports.`,

  implements: [
    'foam.nanos.NanoService',
    'foam.nanos.http.WebAgent',
    'net.nanopay.security.csp.CSPReporter'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.http.HttpServletResponse'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'CSPViolationsDAO'
    }
  ],

  methods: [
    {
      name: 'processReport',
      javaReturns: 'boolean',
      javaCode: `
System.out.println("DHIREN DEBUG: new CSP report received.");
return true;
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaCode:
`System.out.println("Dhiren debug: executing...");`
    },
    {
      name: 'start',
      javaReturns: 'void',
      javaCode:
`CSPViolationsDAO_ = (DAO) getX().get("CSPViolationsDAO");
System.out.println("DHIREN DEBUG: CSPReportService is running!");`
    }
  ]
});
