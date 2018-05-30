package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.LiquidityService;
import net.nanopay.tx.model.Transaction;


public class LiquidityDAO extends ProxyDAO {

  public LiquidityDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }


  @Override
  public FObject put_(X x, FObject obj) {
    Transaction txn = (Transaction) obj;
    FObject ret = null;
    try {
      ret = super.put_(x, obj);
    } catch ( RuntimeException exception ) {
      throw exception;
    }

    if ( txn.getType() == TransactionType.NONE ) {
      LiquidityService ls = (LiquidityService) x.get("liquidityService");
      ls.liquifyUser(txn.getPayerId());
      ls.liquifyUser(txn.getPayeeId());
    }
    return ret;
  }
}