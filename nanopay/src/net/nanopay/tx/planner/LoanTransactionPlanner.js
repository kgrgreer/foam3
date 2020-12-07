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
  package: 'net.nanopay.tx.planner',
  name: 'LoanTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Plans Loan transactions`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.mlang.MLang',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.Account',
    'net.nanopay.account.LoanAccount',
    'net.nanopay.account.LoanedTotalAccount',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.InterestTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.List',
    'java.util.ArrayList',
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
        Account sourceAccount = quote.getSourceAccount();
        Account destinationAccount = quote.getDestinationAccount();

        Transaction txn = (Transaction) requestTxn.fclone();
        if ( txn instanceof InterestTransaction ){
          txn.setStatus(TransactionStatus.COMPLETED);
          quote.addTransfer(true, txn.getSourceAccount(), -txn.getAmount(), 0);
          quote.addTransfer(true, txn.getDestinationAccount(), txn.getAmount(), 0);
          return txn;
        }

        TransactionLineItem withdrawLineItem = null;
        TransactionLineItem depositLineItem = null;
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        if ( sourceAccount instanceof LoanAccount ) {
          LoanAccount theLoanAccount = (LoanAccount) sourceAccount;
          if ( theLoanAccount.getPrincipal() < ( txn.getAmount() - ( (long) theLoanAccount.findBalance(x) ) ) ) {
            ((Logger) x.get("logger")).error("Transaction Exceeds Loan Account Principal Limit" + txn.getId());
            throw new RuntimeException("Transaction Exceeds Loan Account Principal Limit");
          }
          LoanedTotalAccount globalLoanAccount = ((LoanedTotalAccount) accountDAO.find(
            MLang.AND(
              MLang.INSTANCE_OF( LoanedTotalAccount.class ),
              MLang.EQ( LoanedTotalAccount.DENOMINATION,theLoanAccount.getDenomination())
            )
          ));

          if ( globalLoanAccount == null ) {
            ((Logger) x.get("logger")).error("Total Loan Account not found");
            throw new RuntimeException("Total Loan Account not found");
          }
          quote.addTransfer(true, theLoanAccount.getId(), -txn.getAmount(), 0);
          quote.addTransfer(true, globalLoanAccount.getId(), txn.getAmount(), 0);
          withdrawLineItem = new TransactionLineItem.Builder(x)
            .setSourceAccount( theLoanAccount.getId() )
            .setDestinationAccount( globalLoanAccount.getId() )
            .setAmount( txn.getAmount() )
            .setCurrency( theLoanAccount.getDenomination() )
            .build();
          txn.setSourceAccount( theLoanAccount.getLenderAccount() );
          quote.setSourceAccount(theLoanAccount.findLenderAccount(x));
        }

        if ( destinationAccount instanceof LoanAccount ) {
          LoanAccount theLoanAccount = (LoanAccount) destinationAccount;
          LoanedTotalAccount globalLoanAccount = ( (LoanedTotalAccount) accountDAO.find(
            MLang.AND(
              MLang.INSTANCE_OF( LoanedTotalAccount.class ),
              MLang.EQ( LoanedTotalAccount.DENOMINATION,theLoanAccount.getDenomination())
            )
          ));

          if ( globalLoanAccount == null ) {
            ((Logger) x.get("logger")).error("Total Loan Account not found");
            throw new RuntimeException("Total Loan Account not found");
          }
          quote.addTransfer(true, globalLoanAccount.getId(), -txn.getAmount(), 0);
          quote.addTransfer(true, theLoanAccount.getId(), txn.getAmount(), 0);
          depositLineItem = new TransactionLineItem.Builder(x)
            .setSourceAccount( globalLoanAccount.getId() )
            .setDestinationAccount( theLoanAccount.getId() )
            .setAmount( txn.getAmount() )
            .setCurrency( theLoanAccount.getDenomination() )
            .build();
          txn.setDestinationAccount(theLoanAccount.getLenderAccount());
          quote.setDestinationAccount(theLoanAccount.findLenderAccount(x));
        }

        Transaction plan = (Transaction) quoteTxn(x, txn, quote).fclone();

        if ( withdrawLineItem != null ) {
          plan.addLineItems( new TransactionLineItem[] {withdrawLineItem} );
        }
        if ( depositLineItem != null ) {
          plan.addLineItems( new TransactionLineItem[] {depositLineItem} );
        }

        quote.getAlternatePlans_().add(plan);
        return null;
      `
    },
  ]
});
