package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.Account;
import net.nanopay.tx.TransactionType;
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.model.LiquidityService;
import net.nanopay.tx.model.Transaction;


public class LiquidityDAO extends ProxyDAO {

  public LiquidityDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }


  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj instanceof CompositeTransaction ) {
      return super.put_(x, obj);
    }

    Transaction txn = (Transaction) obj;
    FObject ret = null;
    try {
      ret = super.put_(x, obj);
    } catch ( RuntimeException exception ) {
      throw exception;
    }

    LiquidityService ls = (LiquidityService) x.get("liquidityService");
    if ( txn.getType() == TransactionType.NONE ) {
      ls.liquifyUser(txn.getSourceAccount());
      ls.liquifyUser(txn.getDestinationAccount());
    } else if ( txn.getType() == TransactionType.BANK_ACCOUNT_PAYMENT ) {
      ls.liquifyUser(txn.findDestinationAccount(x).getId());
    }
    return ret;
  }
}
