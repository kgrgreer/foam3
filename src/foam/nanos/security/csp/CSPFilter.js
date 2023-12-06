/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.security.csp',
  name: 'CSPFilter',

  documentation: 'Content-Security-Policy servlet filter',

  javaImplements: [ 'javax.servlet.Filter' ],

  javaImports: [
    'javax.servlet.*',
    'javax.servlet.http.HttpServletResponse'
  ],

  javaCode: `
    protected FilterConfig config_;
    protected String csp_;
  `,

  methods: [
    {
      name: 'init',
      args: 'FilterConfig config',
      javaThrows: [ 'ServletException' ],
      javaCode: `
        this.config_ = config;
        this.csp_    = config.getInitParameter("CONTENT_SECURITY_POLICY");
      `
    },
    {
      name: 'doFilter',
      args: 'ServletRequest request, ServletResponse response, FilterChain chain',
      javaThrows: [ 'java.io.IOException', 'ServletException' ],
      javaCode: `
        var httpResponse = (HttpServletResponse) response;
        httpResponse.setHeader("Content-Security-Policy", csp_);

        chain.doFilter(request, response);
      `
    },
    {
      name: 'destroy',
      javaCode: '// noop'
    }
  ]
});
