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
          quote.addTransfer(txn.getSourceAccount(), -txn.getAmount());
          quote.addTransfer(txn.getDestinationAccount(), txn.getAmount());
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
          quote.addTransfer(theLoanAccount.getId(), -txn.getAmount());
          quote.addTransfer(globalLoanAccount.getId(), txn.getAmount());
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
          quote.addTransfer(globalLoanAccount.getId(), -txn.getAmount());
          quote.addTransfer(theLoanAccount.getId(), txn.getAmount());
          depositLineItem = new TransactionLineItem.Builder(x)
            .setSourceAccount( globalLoanAccount.getId() )
            .setDestinationAccount( theLoanAccount.getId() )
            .setAmount( txn.getAmount() )
            .setCurrency( theLoanAccount.getDenomination() )
            .build();
          txn.setDestinationAccount(theLoanAccount.getLenderAccount());
          quote.setDestinationAccount(theLoanAccount.findLenderAccount(x));
        }

        Transaction plan = (Transaction) quoteTxn(x, txn).fclone();

        if ( withdrawLineItem != null ) {
          plan.addLineItems( new TransactionLineItem[] {withdrawLineItem},null );
        }
        if ( depositLineItem != null ) {
          plan.addLineItems( new TransactionLineItem[] {depositLineItem},null );
        }

        quote.getAlternatePlans_().add(plan);
        return null;
      `
    },
  ]
});
