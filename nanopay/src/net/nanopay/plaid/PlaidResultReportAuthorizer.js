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
  package: 'net.nanopay.plaid',
  name: 'PlaidResultReportAuthorizer',
  implements: ['foam.nanos.auth.Authorizer'],

  documentation: `AuthorizableAuthorizer which checks if user has access to the PlaidResultReport`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',

    'net.nanopay.plaid.PlaidResultReport'
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
        User user = ((Subject) x.get("subject")).getUser();
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
        User user = ((Subject) x.get("subject")).getUser();
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
        throw new AuthorizationException("You don't have permissions to view plaidResultReport");
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
