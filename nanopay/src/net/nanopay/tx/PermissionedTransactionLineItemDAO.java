package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import net.nanopay.tx.model.Transaction;

import java.util.ArrayList;

public class PermissionedTransactionLineItemDAO extends ProxyDAO {

  public static Transaction filterLineItems(X x, Transaction transaction) {
    var newTransaction = (Transaction) transaction.fclone();
    var transactionLineItems = new ArrayList<TransactionLineItem>();

    var auth = (AuthService) x.get("auth");
    for ( var lineItem : newTransaction.getLineItems() ) {
      if ( auth.check(x, "read." +  lineItem.getClassInfo().getId()) ) {
        transactionLineItems.add(lineItem);
      }
    }

    newTransaction.setLineItems(transactionLineItems.toArray(new TransactionLineItem[0]));
    return newTransaction;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return super.select_(x, new PermissionedTransactionLineItemSink(sink),  skip, limit, order, predicate);
  }

  @Override
  public FObject find_(X x, Object id) {
    return filterLineItems(getX(), (Transaction) super.find_(x, id));
  }

  PermissionedTransactionLineItemDAO(X x, DAO delegate) {
    super(x, delegate);
  }
}
