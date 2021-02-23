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
  package: 'net.nanopay.interac.service',
  name: 'InteracTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'java.security.SecureRandom',
    'java.security.NoSuchAlgorithmException',
    'java.util.Random',
    'java.util.UUID',
    'net.nanopay.tx.model.Transaction',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.logger.Logger'
  ],

  messages: [
    { name: 'SOURCE_ACCOUNT_NOT_FOUND_ERROR_MSG', message: 'Source account not found for transaction ' },
    { name: 'INVALID_PAYER_ACCOUNT_ERROR_MSG', message: 'Invalid Source/Payer Account' },
    { name: 'DEST_ACCOUNT_NOT_FOUND_ERROR_MSG', message: 'Destination account not found for transaction ' },
    { name: 'INVALID_PAYEE_ACCOUNT_ERROR_MSG', message: 'Invalid Destination/Payee Account' },
    { name: 'DETAILED_INVALID_AMOUNT_ERROR_MSG', message: 'Invalid transaction amount for transaction ' },
    { name: 'INVALID_AMOUNT_ERROR_MSG', message: 'Invalid amount' },
    { name: 'INVALID_RATE_ERROR_MSG', message: 'Invalid rate' },
    { name: 'INVALID_PURPOSE_ERROR_MSG', message: 'Invalid purpose' },
    { name: 'UNEXPECTED_EXCEPTION_ERROR_MSG', message: 'Unexpected exception in InteracTransactionDAO' },
    { name: 'UNSUPPORTED_OPERATION_ERROR_MSG', message: 'Unsupported operation: ' },
    { name: 'CANNOT_GET_SECURE_RANDOM_ERROR_MSG', message: 'Could not get strong SecureRandom' }
  ],

  properties: [
    {
      class: 'Object',
      javaType: 'java.util.Random',
      name: 'random'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public InteracTransactionDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
            setOf(net.nanopay.tx.model.Transaction.getOwnClassInfo());
            try {
              setRandom(SecureRandom.getInstanceStrong());
            } catch (NoSuchAlgorithmException e) {
              throw new RuntimeException(CANNOT_GET_SECURE_RANDOM_ERROR_MSG);
            }
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
        DAO transactionDAO          = (DAO) getX().get("localTransactionDAO");
        DAO canadianTransactionDAO  = (DAO) getX().get("canadaTransactionDAO");
        DAO indiaTransactionDAO     = (DAO) getX().get("indiaTransactionDAO");
        Logger logger = (Logger) x.get("logger");

        Transaction transaction = (Transaction) obj;
        if ( transaction.findSourceAccount(x) == null ) {
          logger.error(SOURCE_ACCOUNT_NOT_FOUND_ERROR_MSG + transaction.getId());
          throw new RuntimeException(INVALID_PAYER_ACCOUNT_ERROR_MSG);
        }

        if ( transaction.findDestinationAccount(x) == null ) {
          logger.error(DEST_ACCOUNT_NOT_FOUND_ERROR_MSG + transaction.getId());
          throw new RuntimeException(INVALID_PAYEE_ACCOUNT_ERROR_MSG);
        }

        if ( transaction.getAmount() < 0 ) {
          logger.error(DETAILED_INVALID_AMOUNT_ERROR_MSG + transaction.getId());
          throw new RuntimeException(INVALID_AMOUNT_ERROR_MSG);
        }

        // if ( transaction.getRate() <= 0 ) {
        //   throw new RuntimeException(INVALID_RATE_ERROR_MSG);
        // }

        // REVIEW: Commented out for TransactionSubClassRefactor
        // if ( transaction.getPurpose() == null ) {
        //   throw new RuntimeException(INVALID_PURPOSE_ERROR_MSG);
        // }

        try {
          Transaction completedTransaction = (Transaction) transactionDAO.put(transaction);

          /**
           * Generate 3 random digits to append to CAXxxx, this will be the
           * Canadian external invoice Id for the demo
           * */
          String externalInvoiceId = "CAxxx" + UUID.randomUUID().toString().substring(0, 3).toUpperCase();
          completedTransaction.setExternalInvoiceId(externalInvoiceId);
          canadianTransactionDAO.put(completedTransaction);

          /**
           * Generate 13 digit random number for IMPS reference number
           * */
          char[] digits = new char[13];
          digits[0] = (char) (getRandom().nextInt(9) + '1');
          for ( int i = 1; i < 13; i++ ) {
            digits[i] = (char) (getRandom().nextInt(10) + '0');
          }

          completedTransaction.setExternalInvoiceId(new String(digits));
          indiaTransactionDAO.put(completedTransaction);

          return completedTransaction;

        } catch (RuntimeException e) {
          logger.error(UNEXPECTED_EXCEPTION_ERROR_MSG, e);
          throw e;
        }
      `
    },
    {
      name: 'select_',
      documentation: 'Overrides all functions to only allow put calls',
      javaCode: `
        throw new UnsupportedOperationException(UNSUPPORTED_OPERATION_ERROR_MSG + "select_");
      `
    },
    {
      name: 'find_',
      javaCode: `
        throw new UnsupportedOperationException(UNSUPPORTED_OPERATION_ERROR_MSG + "find_");
      `
    },
    {
      name: 'remove_',
      javaCode: `
        throw new UnsupportedOperationException(UNSUPPORTED_OPERATION_ERROR_MSG + "remove_");
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        throw new UnsupportedOperationException(UNSUPPORTED_OPERATION_ERROR_MSG + "removeAll_");
      `
    }
  ]
});
