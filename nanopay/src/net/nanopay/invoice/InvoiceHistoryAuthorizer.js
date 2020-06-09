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
  package: 'net.nanopay.invoice',
  name: 'InvoiceHistoryAuthorizer',
  implements: ['foam.nanos.auth.Authorizer'],

  documentation: `AuthorizableAuthorizer which checks if user has access to the invoice history record`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.history.HistoryRecord',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',

    'net.nanopay.invoice.model.Invoice',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null ) {
          throw new foam.nanos.auth.AuthenticationException("User not found.");
        } else if ( ! "admin".equalsIgnoreCase(user.getGroup()) && ! "system".equalsIgnoreCase(user.getGroup())) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        DAO invoiceDAO = (DAO) x.get("invoiceDAO");
        User user = ((Subject) x.get("subject")).getUser();

        Invoice invoice = (Invoice) invoiceDAO.find(((HistoryRecord) obj).getObjectId());
        if ( invoice == null )
          throw new AuthorizationException("Invoice not found! Access to its history is prohibited.");
        if ( (invoice.getPayeeId() != user.getId()) && (invoice.getPayerId() != user.getId()) ){
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null ) {
          throw new foam.nanos.auth.AuthenticationException("User not found.");
        } else if ( ! "admin".equalsIgnoreCase(user.getGroup()) && ! "system".equalsIgnoreCase(user.getGroup())) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null ) {
          throw new foam.nanos.auth.AuthenticationException("User not found.");
        } else if ( ! "admin".equalsIgnoreCase(user.getGroup()) && ! "system".equalsIgnoreCase(user.getGroup())) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'checkGlobalRead',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        return authService.check(x, "invoicehistory.read.*");
      `
    },
    {
      name: 'checkGlobalRemove',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        return authService.check(x, "invoicehistory.remove.*");
      `
    }
  ],
});
