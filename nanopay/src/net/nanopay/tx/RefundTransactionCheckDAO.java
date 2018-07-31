package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.sink.Count;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.EQ;

public class RefundTransactionCheckDAO
  extends ProxyDAO
{
  public RefundTransactionCheckDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    if ( obj instanceof RefundTransaction ) {
      return getDelegate().put_(x, obj);
    }

    RefundTransaction transaction = (RefundTransaction) obj;

    // transaction is a refund
    if ( TransactionType.REFUND.equals(transaction.getType()) ) {
      // check if another transaction with same refund id exists
      Count count = new Count();
      count = (Count) getDelegate().where(EQ(
          RefundTransaction.REFUND_TRANSACTION_ID, transaction.getRefundTransactionId()
      )).select(count);

      if ( count.getValue() > 0 ) {
        throw new RuntimeException("Transaction already refunded");
      }

      // check if original transaction exists
      Transaction refunded = (Transaction) getDelegate().find_(x, transaction.getRefundTransactionId());
      if ( refunded == null ) {
        throw new RuntimeException("Unable to find transaction to refund");
      }

      // check if original transaction is already refunded
      if ( TransactionStatus.REFUNDED.equals(transaction.getStatus()) ) {
        throw new RuntimeException("Transaction already refunded");
      }
    }

    return getDelegate().put_(x, obj);
  }
}
