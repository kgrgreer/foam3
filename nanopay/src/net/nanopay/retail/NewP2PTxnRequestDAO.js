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
  name: 'NewP2PTxnRequestDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.Email',
    'foam.util.SafetyUtil',
    'net.nanopay.retail.model.P2PTxnRequest',
    'net.nanopay.retail.model.P2PTxnRequestStatus',
    'java.util.Date'
  ],

  messages: [
    { name: 'CUR_USER_NOT_REQUESTOR_ERROR_MSG', message: 'Current user is not the requestor' },
    { name: 'EMAIL_VERIF_REUQUIRED_FOR_MONEY_REQUEST_ERROR_MSG', message: 'Email verification is required to send a money request' },
    { name: 'CANNOT_REQUEST_MONEY_FOR_YOURSELF_ERROR_MSG', message: 'Cannot request money from yourself' },
    { name: 'INVALID_REQUESTEE_EMAIL_ERROR_MSG', message: 'Requestee\'s Email is invalid' },
    { name: 'INVALID_AMOUNT_PROVIDED_FOR_REQUEST_ERROR_MSG', message: 'Invalid amount provided for the request' },
    { name: 'MESSAGE_TOO_LONG_ERROR_MSG', message: 'Messages can\'t be more than 250 characters' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public NewP2PTxnRequestDAO(X x, DAO delegate) {
            setDelegate(delegate);
            setX(x);
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

        if ( ! isNewRequest(request) ) {
          return getDelegate().put_(x, obj);
        }

        validateRequest(x, request);

        P2PTxnRequest requestClone = (P2PTxnRequest) obj.fclone();

        // always set status to Pending.
        requestClone.setStatus(P2PTxnRequestStatus.PENDING);

        // set date
        requestClone.setDateRequested(new Date());

        // set last updated as Date requested for new requests
        requestClone.setLastUpdated(requestClone.getDateRequested());

        return getDelegate().put_(x, (FObject) requestClone);
      `
    },
    {
      name: 'isNewRequest',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'P2PTxnRequest', name: 'request' }
      ],
      javaCode: `
        return this.find_(getX(), request) == null;
      `
    },
    {
      name: 'validateRequest',
      visibility: 'protected',
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'P2PTxnRequest', name: 'request' }
      ],
      javaThrows: ['java.lang.RuntimeException'],
      javaCode: `
        User currentUser = ((Subject) x.get("subject")).getUser();

        // check if the requestor's email is current user's email
        if ( ! request.getRequestorEmail().equals(currentUser.getEmail()) ) {
          throw new RuntimeException(CUR_USER_NOT_REQUESTOR_ERROR_MSG);
        }

        // check if the requestors email is verified
        if ( ! currentUser.getEmailVerified() ) {
          throw new RuntimeException(EMAIL_VERIF_REUQUIRED_FOR_MONEY_REQUEST_ERROR_MSG);
        }

        // check if the user is not requesting himself
        if ( request.getRequesteeEmail().equals(currentUser.getEmail()) ) {
          throw new RuntimeException(CANNOT_REQUEST_MONEY_FOR_YOURSELF_ERROR_MSG);
        }

        // check if requestee's email is valid
        if ( ! Email.isValid(request.getRequesteeEmail()) ) {
          throw new RuntimeException(INVALID_REQUESTEE_EMAIL_ERROR_MSG);
        }

        // valid amount
        if ( request.getAmount() <= 0 ) {
          throw new RuntimeException(INVALID_AMOUNT_PROVIDED_FOR_REQUEST_ERROR_MSG);
        }

        // validate message length
        if ( ! SafetyUtil.isEmpty(request.getMessage()) && request.getMessage().length() > 250 ) {
          throw new RuntimeException(MESSAGE_TOO_LONG_ERROR_MSG);
        }
      `
    }
  ]
});

