/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.ProxySink;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import net.nanopay.tx.model.Transaction;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.stream.Collectors;

public class PermissionedTransactionLineItemDAO extends ProxyDAO {

  public PermissionedTransactionLineItemDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  public static Transaction filterLineItems(X x, Transaction transaction) {
    if ( transaction == null ) return null;

    var newTransaction = (Transaction) transaction.fclone();
    newTransaction.clearLineItems();
    final var auth = (AuthService) x.get("auth");

    newTransaction.setLineItems(Arrays.stream(transaction.getLineItems())
      .filter(lineItem -> {
        try {
          var perm = lineItem.getClass().getSimpleName().toLowerCase() + ".read." + lineItem.getId();
          return auth.check(x, perm);
        } catch (Throwable t) {
          return false;
        }
      })
      .toArray(TransactionLineItem[]::new));

    return newTransaction;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    var proxySink = (ProxySink) super.select_(x, new PermissionedTransactionLineItemSink(x, sink),  skip, limit, order, predicate);
    return proxySink.getDelegate();
  }

  @Override
  public FObject find_(X x, Object id) {
    return filterLineItems(x, (Transaction) super.find_(x, id));
  }
}
