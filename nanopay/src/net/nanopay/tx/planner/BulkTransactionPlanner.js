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
  name: 'BulkTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `
    Planner that supports one to many transactions and one to one transactions.

    The final transaction chain is:

        Bulk -> (CI) -> Composite -> [ Compliance1 -> Digital1 -> (CO1), ..., Compliance_N -> Digital_N -> (CO_N) ]

    Where (CI) is optional cash-in transaction, Compliance1, Digital1 and (CO1)
    are the first child compliance, digital and optional cash-out transactions,
    and Compliance_N, Digital_N and (CO_N) are the N-th child transactions of
    respective types.
  `,

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.liquidity.LiquiditySettings',
    'net.nanopay.payment.PADType',
    'net.nanopay.payment.PADTypeLineItem',
    'net.nanopay.tx.BulkTransaction',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.PlanCostComparator',
    'static foam.mlang.MLang.*',
    'java.util.ArrayList',
    'java.util.Collections',
    'java.util.List'
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        BulkTransaction bulkTxn = (BulkTransaction) requestTxn.fclone();
        PADType bulkTxnPADType = PADTypeLineItem.getPADTypeFrom(x, bulkTxn);
        DAO dao = (DAO) x.get("localAccountDAO");
        DAO userDAO = (DAO) x.get("localUserDAO");

        long sum = 0;
        Transaction[] childTransactions = bulkTxn.getChildren();
        CompositeTransaction ct = new CompositeTransaction();
        // Set the composite transaction as a quoted transaction so that
        // it won't be quoted in the DigitalTransactionPlanDAO decorator.
        // In order to set the composite transaction as a quoted one, it requires
        // to have both source account and destination account setup.
        ct.setSourceAccount(bulkTxn.getSourceAccount());
        ct.setDestinationAccount(bulkTxn.getDestinationAccount());
        ct.setPlanner(getId());

        for (Transaction childTransaction : childTransactions) {
          // Sum amount of child transactions
          sum += childTransaction.getAmount();

          // Set the source of each child transaction to its parent destination digital account
          childTransaction.setSourceAccount(bulkTxn.getDestinationAccount());

          User payee = (User) userDAO.find_(x, childTransaction.getPayeeId());
          // Get the default digital accounts
          List<DigitalAccount> digitalList = ((ArraySink) dao.where(
            AND(
              EQ(Account.OWNER, payee.getId()),
              CLASS_OF(DigitalAccount.class),
              EQ(Account.DENOMINATION, childTransaction.getDestinationCurrency()),
              EQ(DigitalAccount.IS_DEFAULT,true)
            )).select(new ArraySink())).getArray();
          List<Transaction> transactionPlans = new ArrayList<>();
          for ( DigitalAccount digitalAccount : digitalList ) {

            LiquiditySettings digitalAccLiquid = digitalAccount.findLiquiditySetting(x);
            Boolean explicitCO = bulkTxn.getExplicitCO();

            // Check liquidity settings of the digital account associated to the digital transaction
            if ( digitalAccLiquid != null && digitalAccLiquid.getHighLiquidity().getEnabled()) {
              // If it is a transaction to GFO or GD, then it should not trigger explicit cashout
              explicitCO = false;
            }

            // Set the destination of each child transaction to payee's default digital account
            childTransaction.setDestinationAccount(getAccount(x, payee, childTransaction.getDestinationCurrency(), explicitCO, digitalAccount).getId());

            // set the pad type for each child transaction
            if ( bulkTxnPADType != null ) { PADTypeLineItem.addTo(childTransaction, bulkTxnPADType.getId()); }
            transactionPlans.add(quoteTxn(x, childTransaction, quote, false));
          }
          // Inject compliance transaction before each child transaction and
          // add it as the next of the composite transaction
          PlanCostComparator costComparator =  new PlanCostComparator.Builder(x).build();
          Collections.sort(transactionPlans, costComparator);
          var quotedChild = transactionPlans.get(0);
          quotedChild = removeSummaryTransaction(quotedChild);
          var compliance = createComplianceTransaction(quotedChild);
          compliance.addNext(quotedChild);
          ct.addNext(compliance);
        }

        // TODO: consider FX.
        // Set the total amount on parent
        bulkTxn.setAmount(sum);

        var payer               = (User) userDAO.find_(x, bulkTxn.getPayerId());
        var payerDigitalAccount = DigitalAccount.findDefault(x, payer, bulkTxn.getSourceCurrency());
        var payerDigitalBalance = payerDigitalAccount.findBalance(x);

        if ( sum > payerDigitalBalance ||
            bulkTxn.getExplicitCI() ) {
          // If digital does not have sufficient funds
          BankAccount payerDefaultBankAccount = BankAccount.findDefault(x, payer, bulkTxn.getSourceCurrency());

          // Create a Cash-In transaction
          Transaction cashInTransaction = new Transaction();
          cashInTransaction.setSourceAccount(payerDefaultBankAccount.getId());
          cashInTransaction.setDestinationAccount(payerDigitalAccount.getId());
          cashInTransaction.setAmount(bulkTxn.getAmount());
          if ( bulkTxnPADType != null ) { PADTypeLineItem.addTo(cashInTransaction, bulkTxnPADType.getId()); }
          cashInTransaction = quoteTxn(x, cashInTransaction, quote, false);

          // Add the compositeTransaction as the next of the cash-in transaction.
          cashInTransaction.addNext(ct);
          // Add the cash-in transaction as the next of the bulk transaction.
          bulkTxn.clearNext();
          bulkTxn.addNext(cashInTransaction);
        } else {
          // If the payer's digital account has sufficient balance, then cash-in transaction is not required.
          // Add the compositeTransaction as the next of the bulk transaction.
          bulkTxn.clearNext();
          bulkTxn.addNext(ct);
        }

        return bulkTxn;
      `
    },
    {
      name: 'getAccount',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'user',
          type: 'User'
        },
        {
          name: 'currency',
          type: 'String'
        },
        {
          name: 'cico',
          type: 'Boolean'
        },
        {
          name: 'destAccount',
          type: 'DigitalAccount'
        }
      ],
      javaType: 'net.nanopay.account.Account',
      javaCode: `
        if ( cico ) {
          Account account = BankAccount.findDefault(x, user, currency);
          if ( account != null ) {
            return account;
          }
          throw new RuntimeException(currency + " BankAccount not found for " + user.getId());
        } else {
          return destAccount;
        }
      `
    },
  ]
});
