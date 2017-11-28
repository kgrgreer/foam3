package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;
import foam.dao.Sink;
import static foam.mlang.MLang.*;
import foam.mlang.sink.Count;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class RefundTransactionCheckDAO
    extends ProxyDAO
{
  public RefundTransactionCheckDAO(DAO delegate) {
    setDelegate(delegate);
  }
  public RefundTransactionCheckDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;

    // Transaction is a refund
    if ( transaction.getRefundTransactionId() > 0 ) {
      Count previouslyRefundedCount = (Count) getDelegate().where(EQ(Transaction.REFUND_TRANSACTION_ID, transaction.getRefundTransactionId())).select(new Count());

      Count refundOfRefundCount = (Count) getDelegate().where(AND(EQ(Transaction.ID, transaction.getRefundTransactionId()), EQ(Transaction.REFUND_TRANSACTION_ID, 0))).select(new Count());

      // Transaction has been previously refunded
      if ( previouslyRefundedCount.getValue() > 0 ) {
        throw new RuntimeException("Transaction has been previously refunded.");
      }

      // Cannot refund a refund
      if ( refundOfRefundCount.getValue() == 0 ) {
        throw new RuntimeException("Cannot refund a refund.");
      }
    }

    return getDelegate().put_(x, obj);
  }
}
