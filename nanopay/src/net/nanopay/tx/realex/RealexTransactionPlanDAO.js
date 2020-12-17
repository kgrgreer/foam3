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

// DEPRECATED. Will need new planner written if ever used.

foam.CLASS({
  package: 'net.nanopay.tx.realex',
  name: 'RealexTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.cico.model.RealexPaymentAccountInfo',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public RealexTransactionPlanDAO(X x, DAO delegate) {
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
        if ( ! ( obj instanceof TransactionQuote ) ) {
          return getDelegate().put_(x, obj);
        }
        TransactionQuote quote = (TransactionQuote) obj;
        if ( ! ( quote.getRequestTransaction() instanceof RealexTransaction) ) {
          return getDelegate().put_(x, obj);
        }
        RealexTransaction transaction = (RealexTransaction) quote.getRequestTransaction();
    
        RealexPaymentAccountInfo paymentAccountInfo = (RealexPaymentAccountInfo) transaction.getPaymentAccountInfo();
        if ( paymentAccountInfo.getType() == net.nanopay.cico.CICOPaymentType.MOBILE && transaction.getStatus() == TransactionStatus.COMPLETED ) {
          // TODO: create Transfer, not Transaction
          // Transfer transfer = new   -- need debig and credit.
          // Transaction txn = new Transaction.Builder(getX())
          //   .setPayerId(transaction.getPayerId())
          //   .setPayeeId(3797) //TODO: create fee collector user
          //   .setStatus(TransactionStatus.COMPLETED)
          //   .setAmount(paymentAccountInfo.getFee())
          //   .build();
          // PlanTransaction plan = new PlanTransaction.Builder(x).build();
          // plan.add(x, transaction);
          // plan.add(x, txn);
          // quote.add(x, plan);
        }
        return super.put_(x, quote);
      `
    }
  ]
});

