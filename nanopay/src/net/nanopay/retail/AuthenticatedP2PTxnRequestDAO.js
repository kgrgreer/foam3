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
  package: 'net.nanopay.retail',
  name: 'AuthenticatedP2PTxnRequestDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'static net.nanopay.retail.utils.P2PTxnRequestUtils.getCurrentUser',
    'static net.nanopay.retail.utils.P2PTxnRequestUtils.getUserByEmail',

    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.retail.model.P2PTxnRequest'
  ],

  constants: [
    {
      name: 'GLOBAL_P2PTxnRequest_READ',
      type: 'String',
      value: 'p2pTxnRequest.read.*'
    }
  ],

  messages: [
    { name: 'NULL_REQUEST_ERROR_MSG', message: 'Request can\'t be null.' },
    { name: 'INVALID_REQUEST_ERROR_MSG', message: 'Invalid Request' },
    { name: 'NO_USER_ERROR_MSG', message: 'User does not exist' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AuthenticatedP2PTxnRequestDAO(X x, DAO delegate) {
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
        User user = getCurrentUser(x);

        if ( obj == null ) {
          throw new RuntimeException(NULL_REQUEST_ERROR_MSG);
        }

        P2PTxnRequest request = (P2PTxnRequest) obj;

        if ( ! isUserAssociatedWithRequest(user, request) ) {
          throw new RuntimeException(INVALID_REQUEST_ERROR_MSG);
        }
        if ( ! checkIfUsersExist(x, request) ) {
          throw new RuntimeException(NO_USER_ERROR_MSG);
        }

        return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
        P2PTxnRequest request = (P2PTxnRequest) getDelegate().find_(x, id);
        User currentUser = getCurrentUser(x);
        AuthService auth = (AuthService) x.get("auth");

        if ( request != null && ! isUserAssociatedWithRequest(currentUser, request) && ! auth.check(x, GLOBAL_P2PTxnRequest_READ) ) {
          return null;
        }
        return (FObject) request;
      `
    },
    {
      name: 'select_',
      javaCode: `
        User currentUser = getCurrentUser(x);
        AuthService auth = (AuthService) x.get("auth");

        boolean hasGlobalRead = auth.check(x, GLOBAL_P2PTxnRequest_READ);

        DAO secureDAO = hasGlobalRead ? getDelegate() : getDelegate().where(OR(
          EQ(P2PTxnRequest.REQUESTEE_EMAIL, currentUser.getEmail()),
          EQ(P2PTxnRequest.REQUESTOR_EMAIL, currentUser.getEmail())));

        return secureDAO.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        // don't remove any request.
        return null;
      `
    },
    {
      name: 'isUserAssociatedWithRequest',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'User', name: 'user' },
        { type: 'P2PTxnRequest', name: 'request' }
      ],
      javaCode: `
        if ( SafetyUtil.isEmpty(request.getRequestorEmail()) ) {
          return false;
        }
    
        if ( SafetyUtil.compare(request.getRequestorEmail(), user.getEmail()) != 0 &&
        SafetyUtil.compare(request.getRequesteeEmail(), user.getEmail()) != 0 ) {
          return false;
        }
        return true;
      `
    },
    {
      name: 'checkIfUsersExist',
      visibility: 'protected',
      type: 'Boolean',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'P2PTxnRequest', name: 'request' }
      ],
      javaCode: `
        // NOTE: Change the condition when Requestee is allowed to not exist on the system.
        if ( getUserByEmail(x, request.getRequesteeEmail()) == null ||
          getUserByEmail(x, request.getRequestorEmail()) == null ) {
          return false;
        }
        return true;
      `
    }
  ]
});
