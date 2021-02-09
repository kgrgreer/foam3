package net.nanopay.tx;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.ProxySink;
import foam.dao.Sink;
import net.nanopay.tx.model.Transaction;

public class PermissionedTransactionLineItemSink extends ProxySink {

  @Override
  public void put(Object obj, Detachable sub) {
    super.put(PermissionedTransactionLineItemDAO.filterLineItems(getX(), (Transaction) obj), sub);
  }

  PermissionedTransactionLineItemSink(X x, Sink sink) {
    super(x, sink);
  }

}
