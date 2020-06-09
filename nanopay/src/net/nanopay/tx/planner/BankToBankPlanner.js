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
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
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
        // create summary transaction when the request transaction is the base Transaction,
        // otherwise conserve the type of the transaction.
        if ( requestTxn.getType().equals("Transaction") ) {
          txn = new SummaryTransaction(x);
          txn.copyFrom(requestTxn);
          txn.addNext(createCompliance(requestTxn));
        } else {
          txn = (Transaction) requestTxn.fclone();
        }

        txn.setStatus(TransactionStatus.PENDING);
        txn.setInitialStatus(TransactionStatus.COMPLETED);

        Account sourceAccount = quote.getSourceAccount();
        Account destinationAccount = quote.getDestinationAccount();
        DigitalAccount sourceDigitalAccount = DigitalAccount.findDefault(x, sourceAccount.findOwner(x), sourceAccount.getDenomination());
        DigitalAccount destinationDigitalAccount = DigitalAccount.findDefault(x, destinationAccount.findOwner(x), destinationAccount.getDenomination());
       
        // Split 1: ABank -> ADigital
        Transaction t1 = new Transaction(x);
        t1.copyFrom(txn);
        // Get Payer Digital Account to fufil CASH-IN
        t1.setDestinationAccount(sourceDigitalAccount.getId());

        // Split 2: ADigital -> BDigital
        Transaction t2 = new Transaction(x);
        t2.copyFrom(txn);
        t2.setSourceAccount(sourceDigitalAccount.getId());
        t2.setDestinationAccount(destinationDigitalAccount.getId());

        // Split 3: BDigital -> BBankAccount
        Transaction t3 = new Transaction(x);
        t3.copyFrom(txn);
        t3.setSourceAccount(destinationDigitalAccount.getId());
        t3.setDestinationAccount(destinationAccount.getId());

        // Put chain transaction together
        Transaction[] cashInPlans = multiQuoteTxn(x, t1);
        Transaction[] digitalPlans = multiQuoteTxn(x, t2);
        Transaction[] cashOutPlans = multiQuoteTxn(x, t3);

        for ( Transaction CIP : cashInPlans ) {
          for ( Transaction DP : digitalPlans ) {
            for ( Transaction COP : cashOutPlans ) {
              Transaction t = (Transaction) txn.fclone();
              Transaction ci = (Transaction) CIP.fclone();
              Transaction dp = (Transaction) DP.fclone();
              Transaction co = (Transaction) COP.fclone();
              dp.addNext(co);
              ci.addNext(dp);
              dp.setInitialStatus(TransactionStatus.COMPLETED);
              ComplianceTransaction ct = createCompliance(txn);
              ct.addNext(ci);
              t.addNext(ct);
              t.addLineItems(CIP.getLineItems());
              t.addLineItems(DP.getLineItems());
              t.addLineItems(COP.getLineItems());
              t.setStatus(TransactionStatus.COMPLETED);
              quote.getAlternatePlans_().add(t);
            }
          }
        }
        return null;
      `
    },
  ]
});
