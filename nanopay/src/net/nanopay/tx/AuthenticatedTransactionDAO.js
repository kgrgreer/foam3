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
  package: 'net.nanopay.tx',
  name: 'AuthenticatedTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.*',
    'foam.nanos.logger.Logger',
    'foam.util.Auth',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.tx.model.Transaction',

    'java.util.List',

    'static foam.mlang.MLang.*'
  ],

  constants: [
    {
      name: 'GLOBAL_TXN_READ',
      type: 'String',
      value: 'transaction.read.*'
    },
    {
      name: 'GLOBAL_TXN_CREATE',
      type: 'String',
      value: 'transaction.create'
    },
    {
      name: 'GLOBAL_TXN_UPDATE',
      type: 'String',
      value: 'transaction.update.*'
    },
    {
      name: 'VERIFICATION_TXN_READ',
      type: 'String',
      value: 'verificationtransaction.read.*'
    }
  ],

  messages: [
    { name: 'INVOICE_NOT_FOUND_ERROR_MSG', message: 'the invoice associated with this transaction could not be found' },
    { name: 'PAY_RECEIVABLE_ERROR_MSG', message: 'You cannot pay a receivable' },
    { name: 'UPDATE_RECEIVABLE_ERROR_MSG', message: 'You cannot update a receivable' },
    { name: 'PAY_DRAFT_ERROR_MSG', message: 'You cannot pay draft invoices' },
    { name: 'USER_NOT_FOUND_ERROR_MSG', message: 'User not found in authenicatedTransactionDAO find_' },
    { name: 'USER_NOT_FOUND_ERROR_MSG2', message: 'User not found in authenicatedTransactionDAO select_' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AuthenticatedTransactionDAO(DAO delegate) {
            setDelegate(delegate);
          }
        
          public AuthenticatedTransactionDAO(X x, DAO delegate) {
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
        AuthService auth = (AuthService) x.get("auth");
        Transaction t = (Transaction) obj;
        Transaction oldTxn = (Transaction) super.find_(x, obj);
        Logger logger = (Logger) x.get("logger");

        if ( user == null ) {
          logger.warning("User not found for " + t.getId());
          throw new AuthenticationException();
        }

        DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
        DAO bareUserDAO = ((DAO) x.get("bareUserDAO")).inX(x);
        //AuthService auth = (AuthService) x.get("auth");
        Account sourceAccount = t.findSourceAccount(x);
        Account destinationAccount = t.findDestinationAccount(x);
        Invoice inv = (Invoice) invoiceDAO.find(t.getInvoiceId());
        User invPayee;
        boolean isSourceAccountOwner = sourceAccount != null && sourceAccount.getOwner() == user.getId();
        boolean isPayer = sourceAccount != null ? sourceAccount.getOwner() == user.getId() : t.getPayerId() == user.getId();
        boolean isPayee = destinationAccount != null ? destinationAccount.getOwner() == user.getId() : t.getPayeeId() == user.getId();
        boolean isCreatePermitted = auth.check(x, GLOBAL_TXN_CREATE);
        boolean isUpdatePermitted = auth.check(x, GLOBAL_TXN_UPDATE);

        if ( ! ( isSourceAccountOwner || isPayer || t instanceof CITransaction && isPayee ) ) {

          /**
           * here we are handling two cases:
           * 1. if an update was made (oldTxn != null), check update perms
           * 2. if a creation was made (oldTxn == null), check creation perms
           */
          if ( oldTxn != null && ! isUpdatePermitted || oldTxn == null && ! isCreatePermitted  ) {
            logger.warning("Permission denied for " + t.getId() + " or " + t.getId());
            throw new AuthorizationException();
          }
        }

        if ( t.getInvoiceId() != 0 ) {
          Invoice invoice = (Invoice) invoiceDAO.find(t.getInvoiceId());

          if ( invoice == null ) {
            logger.error("The invoice associated with this transaction could not be found for transaction " + t.getId());
            throw new RuntimeException(INVOICE_NOT_FOUND_ERROR_MSG);
          }

          if ( invoice.getPayerId() != user.getId() ) {
            if ( oldTxn == null ) {
              logger.error("You cannot pay a receivable " + t.getId());
              throw new AuthorizationException(PAY_RECEIVABLE_ERROR_MSG);
            }
            else if ( ! isUpdatePermitted ) {
              logger.error("You cannot update a receivable " + t.getId());
              throw new AuthorizationException(UPDATE_RECEIVABLE_ERROR_MSG);
            }
          }

          if ( invoice.getDraft() ) {
            logger.error("You cannot pay a draft " + t.getId());
            throw new AuthorizationException(PAY_DRAFT_ERROR_MSG);
          }

          if ( ! auth.check(x, "business.invoice.pay") || ! auth.check(x, "user.invoice.pay") ) {
            invoice = (Invoice) invoice.fclone();
            invoice.setPaymentMethod(PaymentStatus.PENDING_APPROVAL);
            invoiceDAO.put(invoice);
            return null;
          }
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          ((Logger) x.get("logger")).error(USER_NOT_FOUND_ERROR_MSG);
          throw new AuthenticationException();
        }

        Transaction t = (Transaction) getDelegate().find_(getX(), id);
        if ( t == null ) {
          return t;
        }

        Logger logger = (Logger) x.get("logger");
        Account destinationAccount = t.findDestinationAccount(x);
        if ( destinationAccount == null ) {
          logger.error(this.getClass().getSimpleName(), id, "destination account", t.getDestinationAccount(), "not found.", t);
        }
        Account sourceAccount = t.findSourceAccount(x);
        if ( sourceAccount == null ) {
          logger.error(this.getClass().getSimpleName(), id, "source account", t.getSourceAccount(), "not found.", t);
        }

        if ( t.findDestinationAccount(x).getOwner() != user.getId() && t.findSourceAccount(x).getOwner() != user.getId() && ! auth.check(x, GLOBAL_TXN_READ) ) {
          return null;
        }
        return t;
      `
    },
    {
      name: 'select_',
      javaCode: `
        DAO dao;
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          ((Logger) x.get("logger")).error(USER_NOT_FOUND_ERROR_MSG2);
          throw new AuthenticationException();
        }

        if ( auth.check(x, GLOBAL_TXN_READ) ) {
          dao = getDelegate();
        } else {
          foam.mlang.sink.Map map = new foam.mlang.sink.Map.Builder(x)
            .setArg1(Account.ID)
            .setDelegate(new ArraySink())
            .build();
          DAO localAccountDAO = ((DAO) x.get("localAccountDAO")).inX(x);
          localAccountDAO.where(EQ(Account.OWNER, user.getId())).select(map);
          List ids = ((ArraySink) map.getDelegate()).getArray();
          dao = getDelegate().where(
            OR(
              IN(Transaction.SOURCE_ACCOUNT, ids),
              IN(Transaction.DESTINATION_ACCOUNT, ids)
            ));
        }

        dao = auth.check(x, VERIFICATION_TXN_READ)
          ? dao
          : dao.where(NOT(INSTANCE_OF(VerificationTransaction.class)));

        return dao.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return null;
      `
    }
  ]
});

