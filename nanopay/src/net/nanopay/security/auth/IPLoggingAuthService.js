/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.security.auth',
  name: 'IPLoggingAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'Service that records request IP adresses when login is attempted',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'DAO loginAttemptDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.AuthService',
    'javax.servlet.http.HttpServletRequest',
    'net.nanopay.auth.LoginAttempt'
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
        LoginAttempt loginAttempt = new LoginAttempt();
        HttpServletRequest request = x.get(HttpServletRequest.class);
        AuthService auth = (AuthService) x.get("auth");
        String ipAddress = request.getRemoteAddr();
        loginAttempt.setIpAddress(ipAddress);
        loginAttempt.setLoginIdentifier(identifier);

        try {
          User user = super.login(x, identifier, password);
          if ( auth.check(x, "loginAttempt.nocluster") ) {
            loginAttempt.setClusterable(false);
          }
          loginAttempt.setLoginAttemptedFor(user.getId());
          loginAttempt.setGroup(user.getGroup());
          loginAttempt.setLoginSuccessful(true);
          ((DAO) getLoginAttemptDAO()).inX(getX()).put(loginAttempt);
          return user;
        } catch (Throwable t) {
          loginAttempt.setLoginSuccessful(false);
          if ( "admin@nanopay.net".equals(identifier) ||
               "admin".equals(identifier) ) {
            loginAttempt.setClusterable(false);
          }
          ((DAO) getLoginAttemptDAO()).inX(getX()).put(loginAttempt);
          throw t;
        }
      `
    }
  ]
});
