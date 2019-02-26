foam.CLASS({
  package: 'net.nanopay.security.auth',
  name: 'IPLoggingAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'Service that records IP addresses when a login is attempted.',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'logger'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'javax.servlet.http.HttpServletRequest',
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        if ( getDelegate() instanceof foam.nanos.NanoService ) {
          ((foam.nanos.NanoService) getDelegate()).start();
        }`
    },
    {
      name: 'login',
      javaCode: `
        HttpServletRequest request = x.get(HttpServletRequest.class);
        String ipAddress = request.getRemoteAddr();
        ((Logger) getLogger()).info("IPLoggingAuthService :: New login attempt from IP :: " + ipAddress + " and user id :: " + userId);
        return super.login(x, userId, password);
      `
    },
    {
      name: 'loginByEmail',
      javaCode: `
        HttpServletRequest request = x.get(HttpServletRequest.class);
        String ipAddress = request.getRemoteAddr();
        ((Logger) getLogger()).info("IPLoggingAuthService :: New login attempt from IP :: " + ipAddress + " and email id :: " + email);
        return super.loginByEmail(x, email, password);
      `
    }
  ]
});
