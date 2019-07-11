package net.nanopay.tx;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;
import foam.nanos.logger.Logger;

public class PreventNotQuotedTransactionDAO extends ProxyDAO {

  public PreventNotQuotedTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
  Transaction txn = (Transaction) obj;
    Logger logger = (Logger) x.get("logger");
    if ( txn.getClass().equals(Transaction.class) ) {
      logger.error("Transaction of Transaction.class cannot be stored " + txn.getId());
      throw new RuntimeException ("Transaction of Transaction.class cannot be stored");
    }
    if ( txn instanceof Transaction ) {
      DAO txnDAO = (DAO) x.get("localTransactionDAO");
      if ( txn.getId() == null || txnDAO.find(txn.getId()) == null ) {
        logger.error("Transaction must be quoted before being stored " + txn.getId());
        throw new RuntimeException ("Transaction must be quoted before being stored");
      }
    }
    return getDelegate().put(txn);
  }
}
