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
  name: 'ExistingP2PTxnRequestDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.retail.model.P2PTxnRequest',
    'net.nanopay.retail.model.P2PTxnRequestStatus',
    'net.nanopay.tx.RetailTransaction',
    'net.nanopay.tx.model.TransactionStatus',

    'java.util.Arrays',
    'java.util.Collections',
    'java.util.Date',
    'java.util.List',

    'static foam.mlang.MLang.EQ',
    'static net.nanopay.retail.utils.P2PTxnRequestUtils.*'
  ],

  messages: [
    { name: 'UPDATE_REQUEST_ERROR_MSG', message: 'Unable to update the request' },
    { name: 'INVALID_REQUEST_OP_ERROR_MSG', message: 'Invalid operation on the request' },
    { name: 'REQUESTEE_INVALID_ACTION_ERROR_MSG', message: 'Requestee can\'t perform this action' },
    { name: 'REQUESTOR_INVALID_ACTION_ERRO_MSG', message: 'Requestor can\'t perform this action' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public static final List<P2PTxnRequestStatus> REQUESTEE_OPERATIONS = Collections.unmodifiableList(
            Arrays.asList(P2PTxnRequestStatus.ACCEPTED,
            P2PTxnRequestStatus.DECLINED));
        
          public static final List<P2PTxnRequestStatus> REQUESTOR_OPERATIONS = Collections.unmodifiableList(
            Arrays.asList(P2PTxnRequestStatus.CANCELLED));
        
          public ExistingP2PTxnRequestDAO(X x, DAO delegate) {
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
        P2PTxnRequest request = (P2PTxnRequest) obj;

        P2PTxnRequest existingRequest = getExistingRequest(request);

        // is a new request
        if ( existingRequest == null ) {
          return getDelegate().put_(x, obj);
        }
        
        validateOperationOnRequest(x, request, existingRequest);

        if ( ! checkReadOnlyFields(request, existingRequest) ) {
          throw new RuntimeException(UPDATE_REQUEST_ERROR_MSG);
        }

        if ( request.getStatus().equals(P2PTxnRequestStatus.ACCEPTED) ) {
          acceptRequest(x, request);
        }

        // request was updated here: update lastUpdated
        request.setLastUpdated(new Date());

        return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'getExistingRequest',
      visibility: 'protected',
      type: 'P2PTxnRequest',
      args: [
        { type: 'P2PTxnRequest', name: 'request' }
      ],
      javaCode: `
        return (P2PTxnRequest) this.find_(getX(), request);
      `
    },
    {
      name: 'validateOperationOnRequest',
      visibility: 'protected',
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'P2PTxnRequest', name: 'request' },
        { type: 'P2PTxnRequest', name: 'existingRequest' },
      ],
      javaThrows: [ 'java.lang.RuntimeException' ],
      javaCode: `
        // check who is updating the request
        User currentUser = getCurrentUser(x);

        // if old status not pending, then invalid operation.
        if ( ! existingRequest.getStatus().equals(P2PTxnRequestStatus.PENDING) ) {
          throw new RuntimeException(INVALID_REQUEST_OP_ERROR_MSG);
        }

        // current user is requestee
        if ( currentUser.getEmail().equals(request.getRequesteeEmail()) ) {
          if ( ! REQUESTEE_OPERATIONS.contains(request.getStatus()) ) {
            throw new RuntimeException(REQUESTEE_INVALID_ACTION_ERROR_MSG);
          }
        }
        // current user is requestor
        else if ( currentUser.getEmail().equals(request.getRequestorEmail()) ) {
          if ( ! REQUESTOR_OPERATIONS.contains(request.getStatus()) ) {
            throw new RuntimeException(REQUESTOR_INVALID_ACTION_ERRO_MSG);
          }
        }
        // current user is not associated with the request
        else {
          throw new RuntimeException(INVALID_REQUEST_OP_ERROR_MSG);
        }
      
      `
    },
    {
      name: 'checkReadOnlyFields',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'P2PTxnRequest', name: 'request' },
        { type: 'P2PTxnRequest', name: 'existingRequest' }
      ],
      javaCode: `
        // check if the readonly fields (all fields but the status) are not changed.
        return request.getId() == existingRequest.getId() &&
          request.getRequesteeEmail().equals(existingRequest.getRequesteeEmail()) &&
          request.getRequestorEmail().equals(existingRequest.getRequestorEmail()) &&
          request.getAmount() == existingRequest.getAmount() &&
          request.getMessage().equals(existingRequest.getMessage()) &&
          request.getLastUpdated().equals(existingRequest.getLastUpdated()) &&
          request.getDateRequested().equals(existingRequest.getDateRequested());
      `
    },
    {
      name: 'acceptRequest',
      visibility: 'protected',
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'P2PTxnRequest', name: 'request' }
      ],
      javaCode: `
        User requestee = getUserByEmail(x, request.getRequesteeEmail());
        User requestor = getUserByEmail(x, request.getRequestorEmail());
        processTxn(requestee, requestor, request.getAmount(), request.getMessage());

        // if not partners, make partners!
        if ( ! isPartner(x, requestee, requestor) ) {
          requestee.getPartners(x).add(requestor);
        }
      `
    },
    {
      name: 'processTxn',
      visibility: 'protected',
      type: 'void',
      args: [
        { type: 'User', name: 'requestee' },
        { type: 'User', name: 'requestor' },
        { type: 'long', name: 'amount' },
        { type: 'String', name: 'message' }
      ],
      javaCode: ` 
        RetailTransaction txn  = new RetailTransaction.Builder(getX())
          .setPayerId(requestee.getId())
          .setPayeeId(requestor.getId())
          .setNotes(message)
          .setAmount(amount)
          .setStatus(TransactionStatus.PENDING)
          .build();

        DAO txnDAO = (DAO) getX().get("localTransactionDAO");
        txnDAO.put(txn);
      `
    }
  ]
});
