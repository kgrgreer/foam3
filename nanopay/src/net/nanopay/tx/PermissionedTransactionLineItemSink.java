package net.nanopay.tx;

import foam.core.Detachable;
import foam.dao.ProxySink;
import foam.dao.Sink;
import net.nanopay.tx.model.Transaction;

public class PermissionedTransactionLineItemSink extends ProxySink {

  @Override
  public void put(Object obj, Detachable sub) {
    super.put(PermissionedTransactionLineItemDAO.filterLineItems(getX(), (Transaction) obj), sub);
  }

  PermissionedTransactionLineItemSink(Sink sink) {
    super(sink);
  }

}
