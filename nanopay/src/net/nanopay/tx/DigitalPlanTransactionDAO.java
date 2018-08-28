package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.model.DigitalTransaction;
import net.nanopay.tx.model.Transaction;

public class DigitalPlanTransactionDAO extends ProxyDAO {

  public DigitalPlanTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    QuoteTransaction quote = (QuoteTransaction) obj;
    Transaction txn = quote.getRequestTransaction();
    if ( txn.findSourceAccount(x) instanceof DigitalAccount && txn.findDestinationAccount(x) instanceof DigitalAccount ) {
      if ( txn.getSourceCurrency() == txn.getDestinationCurrency() ) {
        PlanTransaction plan = new PlanTransaction.Builder(x).build();
        DigitalTransaction dt = new DigitalTransaction.Builder(x).build();
        dt.copyFrom(txn);
        plan.add(x, dt);
        quote.add(x, plan);
      }
    }
    return super.put_(x, quote);
  }
}
