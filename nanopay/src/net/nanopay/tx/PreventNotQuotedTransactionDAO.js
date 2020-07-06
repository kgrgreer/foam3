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
  name: 'PreventNotQuotedTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction',
    'foam.nanos.logger.Logger'
  ],

  messages: [
    { name: 'TRANS_CLASS_SAVE_ERROR_MSG', message: 'Transaction of Transaction.class cannot be stored' },
    { name: 'TRANS_NOT_QUOTE_BEFORE_SAVE_ERROR_MSG', message: 'Transaction must be quoted before being stored' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PreventNotQuotedTransactionDAO(X x, DAO delegate) {
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
        Transaction txn = (Transaction) obj;
        Logger logger = (Logger) x.get("logger");
        if ( txn.getClass().equals(Transaction.class) ) {
          logger.error(TRANS_CLASS_SAVE_ERROR_MSG + " " + txn.getId());
          throw new RuntimeException (TRANS_CLASS_SAVE_ERROR_MSG);
        }
        if ( txn instanceof Transaction ) {
          DAO txnDAO = (DAO) x.get("localTransactionDAO");
          if ( txn.getId() == null || txnDAO.find(txn.getId()) == null ) {
            logger.error(TRANS_NOT_QUOTE_BEFORE_SAVE_ERROR_MSG + " " + txn.getId());
            throw new RuntimeException (TRANS_NOT_QUOTE_BEFORE_SAVE_ERROR_MSG);
          }
        }
        return getDelegate().put(txn);
      `
    }
  ]
});

