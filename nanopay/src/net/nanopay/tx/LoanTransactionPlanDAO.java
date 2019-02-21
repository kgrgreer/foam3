package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.MLang;
import net.nanopay.account.LoanAccount;
import net.nanopay.account.LoanedTotalAccount;
import net.nanopay.tx.model.Transaction;

public class LoanTransactionPlanDAO extends ProxyDAO {

  public LoanTransactionPlanDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {

    if (!(obj instanceof TransactionQuote)) return getDelegate().put_(x, obj);

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction txn = quote.getRequestTransaction();

    if (!(txn.findSourceAccount(x) instanceof LoanAccount || txn.findDestinationAccount(x) instanceof LoanAccount))
      return getDelegate().put_(x, obj);

    DigitalTransaction loanWithdraw = null;
    DigitalTransaction loanPay = null;

    if (txn.findSourceAccount(x) instanceof LoanAccount) {
      DAO accountDAO = (DAO) x.get("accountDAO");
      LoanAccount sourceAccount = (LoanAccount) txn.findSourceAccount(x);
      //(LoanAccount) accountDAO.find_(x, txn.getSourceAccount());

      // Create loan transaction to reflect movement
      loanWithdraw = new DigitalTransaction.Builder(x)
        .setSourceAccount(sourceAccount.getId())
        .setSourceCurrency(sourceAccount.getDenomination())
        .setDestinationCurrency(sourceAccount.getDenomination())
        .setDestinationAccount(((LoanedTotalAccount) accountDAO.find(MLang.AND(MLang.INSTANCE_OF(LoanedTotalAccount.class),MLang.EQ(LoanedTotalAccount.DENOMINATION,sourceAccount.getDenomination())))).getId())//<----------****
        .setIsQuoted(true)
        .setAmount(txn.getAmount())
        .setName("Withdrawl from Loan Account")
        .build();

      txn.setSourceAccount(sourceAccount.getLenderAccount());
    }

    if (txn.findDestinationAccount(x) instanceof LoanAccount) {
      DAO accountDAO = (DAO) x.get("accountDAO");
      LoanAccount destinationAccount = (LoanAccount) txn.findDestinationAccount(x);
      //(LoanAccount) accountDAO.find_(x, txn.getDestinationAccount());


      // Create a loan tx from loan account to global loan account
      loanPay = new DigitalTransaction.Builder(x)
        .setDestinationAccount(destinationAccount.getId())
        .setSourceCurrency(destinationAccount.getDenomination())
        .setDestinationCurrency(destinationAccount.getDenomination())
        .setSourceAccount(((LoanedTotalAccount) accountDAO.find(MLang.AND(MLang.INSTANCE_OF(LoanedTotalAccount.class), MLang.EQ(LoanedTotalAccount.DENOMINATION,destinationAccount.getDenomination())))).getId()) //<----------****
        .setIsQuoted(true)
        .setAmount(txn.getAmount())
        .setName("Payment to Loan Account")
        .build();

      txn.setDestinationAccount(destinationAccount.getLenderAccount());
    }

    // finish the quote
    quote.setRequestTransaction(txn);
    quote = (TransactionQuote) getDelegate().put_(x, quote);

    // add loan txs to best plan
    Transaction t = quote.getPlan();
    while (t.getNext() != null) {
      t = t.getNext();
    }
    if (loanPay != null) {
      t.setNext(loanPay);

      t = loanPay;
    }
    if (loanWithdraw != null) {
      t.setNext(loanWithdraw);
    }

    // add loan tx to all plans
    for (Transaction plan : quote.getPlans()) {
      t = plan;
      while (t.getNext() != null) {
        t = t.getNext();
      }
      if (loanPay != null) {
        t.setNext(loanPay);
        t = loanPay;
      }
      if (loanWithdraw != null) t.setNext(loanWithdraw);
    }

    return quote;
  }
}
