package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.CashOutFrequency;
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
    FObject ret =  super.put_(x, obj);
    LiquidityService ls = (LiquidityService) x.get("liquidityService");

    if ( txn.findSourceAccount(x).getOwner() != txn.findDestinationAccount(x).getOwner() ) {
      if ( txn.findSourceAccount(x) instanceof DigitalAccount ) {
        ls.liquifyAccount(txn.getSourceAccount(), CashOutFrequency.PER_TRANSACTION);
      }

      if (txn.findDestinationAccount(x) instanceof DigitalAccount) {
        ls.liquifyAccount(txn.getDestinationAccount(), CashOutFrequency.PER_TRANSACTION);
      }
    }

    return ret;
  }
}
