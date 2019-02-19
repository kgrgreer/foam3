package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.LoanAccount;
import net.nanopay.tx.model.Transaction;

import java.util.ArrayList;
import java.util.List;

public class LoanTransactionPlanDAO extends ProxyDAO {

  public LoanTransactionPlanDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {

    if ( ! ( obj instanceof TransactionQuote ) ) {
      return getDelegate().put_(x, obj);
    }

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction txn = quote.getRequestTransaction();
    DAO accountDAO = (DAO) x.get("accountDAO");

    // Borrowing from a Loan Account
    if ( txn.findSourceAccount(x) instanceof LoanAccount ) {

      LoanAccount sourceAccount = (LoanAccount) accountDAO.find_(x, txn.getSourceAccount());
      long lenderAccountNum = sourceAccount.getLenderAccount();

      Transfer loanTransfer = new Transfer.Builder(x)
        .setAmount(-txn.getAmount())
        .setAccount(txn.getSourceAccount())
        .build();

      List loanTransfers = new ArrayList();
      loanTransfers.add(loanTransfer);
      txn.add((Transfer[]) loanTransfers.toArray(new Transfer[0]));

      txn.setSourceAccount(lenderAccountNum);
    }

    // Paying a Loan Account
    if ( txn.findDestinationAccount(x) instanceof LoanAccount ) {

      LoanAccount destinationAccount = (LoanAccount) accountDAO.find_(x, txn.getDestinationAccount());

      Transfer loanTransfer = new Transfer.Builder(x)
        .setAmount(txn.getAmount())
        .setAccount(txn.getDestinationAccount())
        .build();

      List loanTransfers = new ArrayList();
      loanTransfers.add(loanTransfer);
      txn.add((Transfer[]) loanTransfers.toArray(new Transfer[0]));

      txn.setDestinationAccount(destinationAccount.getLenderAccount());
    }

    return getDelegate().put_(x, obj);
  }
}
