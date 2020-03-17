foam.CLASS({
  package: 'net.nanopay.plaid',
  name: 'PlaidResultReportAuthorizer',
  implements: ['foam.nanos.auth.Authorizer'],

  documentation: `AuthorizableAuthorizer which checks if user has access to the PlaidResultReport`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'net.nanopay.plaid.PlaidResultReport',
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        if ( ! authService.check(x, "plaidresultreport.create") ) {
          throw new AuthorizationException("You don't have permissions to create plaidResultReport");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        User user = (User) x.get("user");
        DAO plaidResultReportDAO = (DAO) x.get("plaidResultReportDAO");
        AuthService authService = (AuthService) x.get("auth");

        PlaidResultReport plaidResultReport = (PlaidResultReport) obj;
        if (! (plaidResultReport.getNanopayUserId() == user.getId()) &&
            ! authService.check(x, "plaidresultreport.update" + obj.getProperty("id"))){
          throw new AuthorizationException("You don't have permissions to view plaidResultReport");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        User user = (User) x.get("user");
        DAO plaidResultReportDAO = (DAO) x.get("plaidResultReportDAO");
        AuthService authService = (AuthService) x.get("auth");

        PlaidResultReport plaidResultReport = (PlaidResultReport) oldObj;
        if (! (plaidResultReport.getNanopayUserId() == user.getId()) &&
            ! authService.check(x, "plaidresultreport.update" + oldObj.getProperty("id"))){
          throw new AuthorizationException("You don't have permissions to update plaidResultReport");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode:`
        User user = (User) x.get("user");
        DAO plaidResultReportDAO = (DAO) x.get("plaidResultReportDAO");
        AuthService authService = (AuthService) x.get("auth");

        PlaidResultReport plaidResultReport = (PlaidResultReport) obj;
        if (! (plaidResultReport.getNanopayUserId() == user.getId())  &&
            ! authService.check(x, "plaidresultreport.delete" + obj.getProperty("id"))){
          throw new AuthorizationException("You don't have permissions to view plaidResultReport");
        }
      `
    },
    {
      name: 'checkGlobalRead',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        return authService.check(x, "plaidresultreport.read.*");
      `
    },
    {
      name: 'checkGlobalRemove',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        return authService.check(x, "plaidresultreport.remove.*");
      `
    },
  ]
})
