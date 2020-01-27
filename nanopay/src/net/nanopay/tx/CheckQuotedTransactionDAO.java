package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.logger.Logger;
import net.nanopay.account.Account;
import net.nanopay.account.Balance;
import net.nanopay.account.ZeroAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class CheckQuotedTransactionDAO extends ProxyDAO {

  private boolean enableQuoteTransferValidation;

  public CheckQuotedTransactionDAO(X x, DAO delegate) {
    this(x, delegate, false);
  }

  public CheckQuotedTransactionDAO(X x, DAO delegate, boolean enableQuoteTransferValidation) {
    setDelegate(delegate);
    setX(x);

    // Set validation flag
    this.enableQuoteTransferValidation = enableQuoteTransferValidation;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction txn = (Transaction) obj;
    if ( ! txn.getIsQuoted() ) {
      TransactionQuote quote = new TransactionQuote();
      quote.setRequestTransaction(txn);
      quote = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).inX(x).put(quote);
      validateQuoteTransfers(x, quote);
      return getDelegate().put_(x, quote.getPlan());
    }
    return getDelegate().put_(x, obj);
  }

  private void validateQuoteTransfers(X x, TransactionQuote quote) {
    if ( ! enableQuoteTransferValidation ) 
      return;
      
    DAO balanceDAO = (DAO) x.get("balanceDAO");
    Logger logger = (Logger) x.get("logger");

    Transaction transaction = quote.getPlan();
    Transfer[] transfers = transaction.getTransfers();

    for ( Transfer transfer : transfers ) {
      transfer.validate();
      Account account = transfer.findAccount(getX());
      if ( account == null ) {
        logger.error(this.getClass().getSimpleName(), "validateQuoteTransfers", "transfer account not found: " + transfer.getAccount(), transfer);
        throw new RuntimeException("Unknown account: " + transfer.getAccount());
      }

      // Skip validation of amounts for transfers to trust accounts (zero accounts) since we don't
      // want to surface these errors to the user during quoting. The error will be caught in the
      // TransactionDAO during validation of transfers there if the trust account doesn't have enough
      // value at that point.
      if ( ! ( account instanceof ZeroAccount ) ) {
        account.validateAmount(x, (Balance) balanceDAO.find(account.getId()), transfer.getAmount());
      }
    }
  }
}