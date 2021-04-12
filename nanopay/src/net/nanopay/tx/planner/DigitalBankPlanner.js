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
  name: 'DigitalBankPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Planner for digital to bank where the owners differ`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.CLASS_OF',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'java.util.ArrayList',
    'java.util.List',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'net.nanopay.fx.FXSummaryTransaction',
  ],

  properties: [
    {
      name: 'multiPlan_',
      value: true
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        Transaction txn;
        if ( SafetyUtil.equals(quote.getDestinationAccount.getDenomination(), quote.getSourceAccount.getDenomination() )) {
          txn = new SummaryTransaction(x);
        }
        else {
          txn = new FXSummaryTransaction(x);
        }
        txn.copyFrom(requestTxn);

        txn.setStatus(TransactionStatus.PENDING);
        txn.setInitialStatus(TransactionStatus.COMPLETED);

        Account destinationAccount = quote.getDestinationAccount();
        foam.nanos.auth.User bankOwner = destinationAccount.findOwner(x);

        DAO dao = (DAO) x.get("localAccountDAO");

        List digitals = ((ArraySink) dao.where(
          AND(
            EQ(Account.OWNER, destinationAccount.getOwner()),
            CLASS_OF(DigitalAccount.class)
          )).select(new ArraySink())).getArray();
        for ( Object obj : digitals ) {
          // todo fix properly
try {
          Account digital = (DigitalAccount) obj;
          // Split 1: Adigital -> BDigital
          Transaction digitalTxn = new Transaction();
          digitalTxn.copyFrom(requestTxn);
          digitalTxn.setDestinationAccount(digital.getId());
          Transaction[] Ds = multiQuoteTxn(x, digitalTxn, quote, false);

          for ( Transaction tx1 : Ds ) {
            // Split 2: BDigital -> BBank
            Transaction co = new Transaction();
            co.copyFrom(requestTxn);
            co.setSourceAccount(digital.getId());
            //Note: if tx1, does not have all the transfers for getTotal this wont work.
            co.setAmount(tx1.getTotal(x, digital.getId()));
            Transaction[] COs = multiQuoteTxn(x, co, quote, false);

            for ( Transaction tx2 : COs ) {
              Transaction Digital = (Transaction) removeSummaryTransaction(tx1).fclone();
              Digital.addNext((Transaction) removeSummaryTransaction(tx2).fclone());
              Transaction t = (Transaction) txn.fclone();
              t.setPlanCost(tx1.getPlanCost() + tx2.getPlanCost());
              t.addNext(Digital);
              quote.getAlternatePlans_().add(t);
            }
          }
      } catch(Exception e){

      }
        }
        return null;
      `
    },
  ]
});
