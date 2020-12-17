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
  package: 'net.nanopay.tx.planner',
  name: 'SecurityBucketPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `A planner for planning securities bucket type transactions. Each specified security is added as a
   a composite child transaction to the bucket transaction`,

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.Amount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.BucketTransaction',
    'net.nanopay.tx.CompositeTransaction',
  ],


  methods: [
    {
      name: 'plan',
      javaCode: `
        BucketTransaction tx = (BucketTransaction) requestTxn;
        CompositeTransaction comp = new CompositeTransaction();

        for ( Amount amnt : tx.getSubTransactions() ) {
          Transaction tSub = new Transaction();
          tSub.copyFrom(tx);
          tSub.setSourceCurrency(amnt.getUnit());
          tSub.setDestinationCurrency(amnt.getUnit());
          tSub.setAmount(amnt.getQuantity());
          comp.addNext(quoteTxn(x, tSub, quote));
        }

        tx.addNext(comp);
        return tx;
      `
    },
  ]
});
