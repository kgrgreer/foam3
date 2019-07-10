package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class CheckQuotedTransactionDAO extends ProxyDAO {

  public CheckQuotedTransactionDAO(X x,DAO delegate) {
    setDelegate(delegate);
    setX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction txn = (Transaction) obj;
    if ( ! txn.getIsQuoted() && txn.getStatus() != TransactionStatus.SCHEDULED ) {
      TransactionQuote quote = new TransactionQuote();
      quote.setRequestTransaction(txn);
      quote = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).inX(x).put(quote);
      return getDelegate().put_(x, quote.getPlan());
    }
    return getDelegate().put_(x, obj);
  }
}