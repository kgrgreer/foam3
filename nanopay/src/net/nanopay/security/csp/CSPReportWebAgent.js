foam.CLASS({
  package: 'net.nanopay.security.csp',
  name: 'CSPReportWebAgent',

  documentation: `Service that fetches all of the incoming CSP Violation
    reports.`,

  implements: [
    'foam.nanos.http.WebAgent'
  ],

  imports: [
    'CSPViolationsDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.http.HttpServletResponse'
  ],

  methods: [
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
    }
  ]
});
