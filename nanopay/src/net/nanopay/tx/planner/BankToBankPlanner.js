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
  name: 'BankToBankPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Planner for bank to bank transactions',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.LimitTransaction',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.CLASS_OF',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'java.util.ArrayList',
    'java.util.List',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
  ],

  properties: [
    {
      name: 'multiPlan_',
      value: true
    },
    {
      name: 'createCompliance',
      class: 'Boolean',
      value: true
    },
    {
      name: 'createLimit',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        Transaction txn;
        // create summary transaction when the request transaction is the base Transaction,
        // otherwise conserve the type of the transaction.
        if ( requestTxn.getType().equals("Transaction") ) {
          txn = new SummaryTransaction(x);
          txn.copyFrom(requestTxn);
        } else {
          txn = (Transaction) requestTxn.fclone();
        }

        txn.setStatus(TransactionStatus.PENDING);
        txn.setInitialStatus(TransactionStatus.COMPLETED);
        if ( txn.getDestinationAmount() != 0 ) {
          txn.setAmount(txn.getDestinationAmount());
        }

        Account sourceAccount = quote.getSourceAccount();
        Account destinationAccount = quote.getDestinationAccount();
        DAO dao = (DAO) x.get("localAccountDAO");

        List digitals = ((ArraySink) dao.where(
          AND(
            EQ(Account.OWNER, sourceAccount.getOwner()),
            CLASS_OF(DigitalAccount.class)
          )).select(new ArraySink())).getArray();

        for ( Object obj : digitals ) {
          DigitalAccount sourceDigitalAccount = (DigitalAccount) obj;

          // Split 1: ABank -> ADigital
          Transaction t1 = new Transaction(x);
          t1.copyFrom(txn);
          t1.setDestinationAccount(sourceDigitalAccount.getId());
          Transaction[] cashInPlans = multiQuoteTxn(x, t1, quote);

          for ( Transaction CIP : cashInPlans ) {
            // Split 2: ADigital -> BBank
            Transaction t2 = new Transaction(x);
            t2.copyFrom(txn);
            t2.setSourceAccount(sourceDigitalAccount.getId());
            //Note: if CIP, does not have all the transfers for getTotal this wont work.
            t2.setAmount(CIP.getTotal(x, sourceDigitalAccount.getId()));
            Transaction[] cashOutPlans = multiQuoteTxn(x, t2, quote);

            for ( Transaction COP : cashOutPlans ) {
              Transaction t = (Transaction) txn.fclone();
              Transaction ci = (Transaction) removeSummaryTransaction(CIP).fclone();
              ci.addNext((Transaction) removeSummaryTransaction(COP).fclone());
              if ( getCreateLimit() ) {
                LimitTransaction lt = createLimitTransaction(txn);
                lt.addNext(ci);
                t.addNext(lt);
              }
              if ( getCreateCompliance() ) {
                ComplianceTransaction ct = createComplianceTransaction(txn);
                ct.addNext(ci);
                t.addNext(ct);
              } else {
                t.addNext(ci);
              }
              t.setStatus(TransactionStatus.COMPLETED);
              t.setPlanCost(t.getPlanCost() + CIP.getPlanCost() + COP.getPlanCost());
              quote.getAlternatePlans_().add(t);
            }
          }
        }
        return null;
      `
    },
  ]
});
