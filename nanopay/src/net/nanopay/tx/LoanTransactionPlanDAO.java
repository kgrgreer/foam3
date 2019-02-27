package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.MLang;
import net.nanopay.account.LoanAccount;
import net.nanopay.account.LoanedTotalAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class LoanTransactionPlanDAO extends ProxyDAO {

  public LoanTransactionPlanDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction txn = quote.getRequestTransaction();

    if( txn instanceof InterestTransaction ){
      txn.setIsQuoted(true);
      txn.setStatus(TransactionStatus.COMPLETED);
      quote.setPlan(txn);
      return quote;
    }

    if ( ! ( txn.findSourceAccount(x) instanceof LoanAccount || txn.findDestinationAccount(x) instanceof LoanAccount ) )
      return getDelegate().put_(x, obj);

    TransactionLineItem withdrawLineItem = null;
    TransactionLineItem depositLineItem = null;

    if ( txn.findSourceAccount(x) instanceof LoanAccount ) {
      DAO accountDAO = (DAO) x.get("accountDAO");
      LoanAccount theLoanAccount = (LoanAccount) txn.findSourceAccount(x);

      if( theLoanAccount.getPrincipal() < ( txn.getAmount() - ( (long) theLoanAccount.findBalance(x) ) ) )
        throw new RuntimeException("Transaction Exceeds Loan Account Principal Limit");

      LoanedTotalAccount globalLoanAccount = ((LoanedTotalAccount) accountDAO.find(MLang.AND(MLang.INSTANCE_OF(LoanedTotalAccount.class), MLang.EQ(LoanedTotalAccount.DENOMINATION,theLoanAccount.getDenomination()))));
      if( globalLoanAccount == null ) throw new RuntimeException("Total Loan Account not found");

      withdrawLineItem = new TransactionLineItem.Builder(x)
        .setSourceAccount(theLoanAccount.getId())
        .setDestinationAccount(globalLoanAccount.getId())
        .setAmount(txn.getAmount())
        .setCurrency( theLoanAccount.getDenomination() )
        .build();

      txn.setSourceAccount(theLoanAccount.getLenderAccount());
    }

    if (txn.findDestinationAccount(x) instanceof LoanAccount) {
      DAO accountDAO = (DAO) x.get("accountDAO");
      LoanAccount theLoanAccount = (LoanAccount) txn.findDestinationAccount(x);

      LoanedTotalAccount globalLoanAccount = ( (LoanedTotalAccount) accountDAO.find( MLang.AND( MLang.INSTANCE_OF( LoanedTotalAccount.class ), MLang.EQ( LoanedTotalAccount.DENOMINATION,theLoanAccount.getDenomination() ) ) ) );
      if( globalLoanAccount == null ) throw new RuntimeException("Total Loan Account not found");

      depositLineItem = new TransactionLineItem.Builder(x)
        .setSourceAccount( globalLoanAccount.getId() )
        .setDestinationAccount( theLoanAccount.getId() )
        .setAmount( txn.getAmount() )
        .setCurrency( theLoanAccount.getDenomination() )
        .build();

      txn.setDestinationAccount(theLoanAccount.getLenderAccount());
    }

    quote.setRequestTransaction(txn);
    Transaction plan = ((TransactionQuote) getDelegate().put_(x, quote)).getPlan();

    //if this is a fx transaction
    if( plan.getDestinationAmount() != 0 && depositLineItem != null ) depositLineItem.setAmount( plan.getDestinationAmount() ) ;

    while(plan.getNext()!=null) plan = plan.getNext();

    if( withdrawLineItem != null ) plan.addLineItems( new TransactionLineItem[] {withdrawLineItem},null );
    if( depositLineItem != null ) plan.addLineItems( new TransactionLineItem[] {depositLineItem},null );

    return quote;
  }
}
