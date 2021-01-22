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

/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionRetryDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Retry a transaction`,

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.ReversalRequest',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      ReversalRequest request = (ReversalRequest) obj;
      if ( ! request.getRefundTransaction())
        return getDelegate().put_(x, obj);
      DAO txnDAO = (DAO) x.get("localTransactionDAO");
      Transaction txn = (Transaction) txnDAO.find(request.getRequestTransaction()) ; // always act on summaryTxn.
      if (! (txn instanceof SummaryTransaction) )
        throw new RuntimeException("not a summary");
      Transaction problemTxn = txn.getStateTxn(x);
      Transaction newTxn = new Transaction();
      // replan the txn.
      newTxn.setSourceAccount(problemTxn.getSourceAccount());
      newTxn.setDestinationAccount(txn.getDestinationAccount());
      newTxn.setAmount(problemTxn.getTotal(x, problemTxn.getSourceAccount()));
      newTxn.setLineItems(request.getLineitems());

      return txnDAO.put(newTxn);
      `
    },

  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public TransactionRetryDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
