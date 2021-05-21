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
  package: 'net.nanopay.security.pii',
  name: 'AuthenticatedPIIRequestDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.*',
    'net.nanopay.security.pii.ViewPIIRequest',

    'static foam.mlang.MLang.EQ'
  ],

  constants: [
    {
      name: 'GLOBAL_PII_REQUEST_CREATE',
      type: 'String',
      value: 'pii_request.create'
    },
    {
      name: 'GLOBAL_PII_REQUEST_READ',
      type: 'String',
      value: 'pii_request.read.*'
    },
    {
      name: 'GLOBAL_PII_REQUEST_UPDATE',
      type: 'String',
      value: 'pii_request.update.*'
    },
    {
      name: 'GLOBAL_PII_REQUEST_DELETE',
      type: 'String',
      value: 'pii_request.remove.*'
    }
  ],

  messages: [
    { name: 'DELETE_ERROR_MSG', message: 'Unable to delete PII Request due to insufficient permissions' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AuthenticatedPIIRequestDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();

        if ( user == null ) {
          throw new AuthenticationException();
        }

        return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        // fetch account from delegate and verify user either owns the account or has global read access
        ViewPIIRequest viewPIIRequest = (ViewPIIRequest) getDelegate().find_(x, id);
        if ( viewPIIRequest != null && viewPIIRequest.getCreatedBy()!= user.getId() && ! auth.check(x, GLOBAL_PII_REQUEST_READ) ) {
          return null;
        }

        return viewPIIRequest;
      `
    },
    {
      name: 'select_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        boolean global = auth.check(x, GLOBAL_PII_REQUEST_READ);
        DAO dao = global ? getDelegate() : getDelegate().where(EQ(ViewPIIRequest.CREATED_BY, user.getId()));
        return dao.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        ViewPIIRequest viewPIIRequest = (ViewPIIRequest) obj;
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        if ( viewPIIRequest != null && ! auth.check(x, GLOBAL_PII_REQUEST_DELETE) ) {
          throw new AuthorizationException(DELETE_ERROR_MSG);
        }
        return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        boolean global = auth.check(x, GLOBAL_PII_REQUEST_DELETE);
        // only admin can delete requests
        if (global) {
          getDelegate().removeAll_(x, skip, limit, order, predicate);
        }
      `
    }
  ]
});


