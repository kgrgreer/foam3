/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'LoanTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Plans Loan transactions',

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
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.List',
    'java.util.ArrayList',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    TransactionQuote quote = (TransactionQuote) obj;
    Account sourceAccount = quote.getSourceAccount();
    Account destinationAccount = quote.getDestinationAccount();
    if ( ! ( sourceAccount instanceof LoanAccount || destinationAccount instanceof LoanAccount ) )
      return getDelegate().put_(x, obj);

    Transaction txn = quote.getRequestTransaction();
    if ( txn instanceof InterestTransaction ){
      txn.setIsQuoted(true);
      txn.setStatus(TransactionStatus.COMPLETED);
      quote.setPlan(txn);
      return quote;
    }

    TransactionLineItem withdrawLineItem = null;
    TransactionLineItem depositLineItem = null;
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    if ( sourceAccount instanceof LoanAccount ) {
      LoanAccount theLoanAccount = (LoanAccount) sourceAccount;
      if ( theLoanAccount.getPrincipal() < ( txn.getAmount() - ( (long) theLoanAccount.findBalance(x) ) ) ) {
        ((Logger) getX().get("logger")).error("Transaction Exceeds Loan Account Principal Limit" + txn.getId());
        throw new RuntimeException("Transaction Exceeds Loan Account Principal Limit");
      }
      LoanedTotalAccount globalLoanAccount = ((LoanedTotalAccount) accountDAO.find(
        MLang.AND(
          MLang.INSTANCE_OF( LoanedTotalAccount.class ),
          MLang.EQ( LoanedTotalAccount.DENOMINATION,theLoanAccount.getDenomination())
        )
      ));

      if ( globalLoanAccount == null ) {
        ((Logger) getX().get("logger")).error("Total Loan Account not found");
        throw new RuntimeException("Total Loan Account not found");
      }
      withdrawLineItem = new TransactionLineItem.Builder(x)
        .setSourceAccount( theLoanAccount.getId() )
        .setDestinationAccount( globalLoanAccount.getId() )
        .setAmount( txn.getAmount() )
        .setCurrency( theLoanAccount.getDenomination() )
        .build();
      txn.setSourceAccount( theLoanAccount.getLenderAccount() );
      quote.setSourceAccount(theLoanAccount.findLenderAccount(getX()));
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
        ((Logger) getX().get("logger")).error("Total Loan Account not found");
        throw new RuntimeException("Total Loan Account not found");
      }
      depositLineItem = new TransactionLineItem.Builder(x)
        .setSourceAccount( globalLoanAccount.getId() )
        .setDestinationAccount( theLoanAccount.getId() )
        .setAmount( txn.getAmount() )
        .setCurrency( theLoanAccount.getDenomination() )
        .build();
      txn.setDestinationAccount(theLoanAccount.getLenderAccount());
      quote.setDestinationAccount(theLoanAccount.findLenderAccount(getX()));
    }

    quote.setRequestTransaction(txn);
    Transaction plan = ((TransactionQuote) getDelegate().put_(x, quote)).getPlan();
    //if this is a fx transaction, destination amount should be in different currency and amount
    //if ( ! ( plan.getDestinationAmount() == 0 ) && ! ( depositLineItem == null ) ) depositLineItem.setAmount( plan.getDestinationAmount() );

    //while(plan.getNext()!=null) plan = plan.getNext();
    if ( withdrawLineItem != null ) plan.addLineItems( new TransactionLineItem[] {withdrawLineItem},null );
    if ( depositLineItem != null ) plan.addLineItems( new TransactionLineItem[] {depositLineItem},null );
    return quote;
    `
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        List all = new ArrayList();
        all.add(new Transfer.Builder(x).setAccount(txn.getSourceAccount()).setAmount(-txn.getTotal()).build());
        all.add(new Transfer.Builder(x).setAccount(txn.getDestinationAccount()).setAmount(txn.getTotal()).build());
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    } 
  ]
});
