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
import java.util.Arrays;
import java.util.stream.Collectors;

public class PermissionedTransactionLineItemDAO extends ProxyDAO {

  public static Transaction filterLineItems(X x, Transaction transaction) {
    if ( transaction == null ) return null;

    var newTransaction = (Transaction) transaction.fclone();
    newTransaction.clearLineItems();
    final var auth = (AuthService) x.get("auth");

    newTransaction.setLineItems(Arrays.stream(transaction.getLineItems())
      .filter(lineItem -> {
        try {
          return auth.check(x, lineItem.getClass().getSimpleName().toLowerCase() + ".read");
        } catch (Throwable t) {
          return false;
        }
      })
      .toArray(TransactionLineItem[]::new));

    return newTransaction;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return super.select_(x, new PermissionedTransactionLineItemSink(x, sink),  skip, limit, order, predicate);
  }

  @Override
  public FObject find_(X x, Object id) {
    return filterLineItems(x, (Transaction) super.find_(x, id));
  }

  PermissionedTransactionLineItemDAO(X x, DAO delegate) {
    super(x, delegate);
  }
}
