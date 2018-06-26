package net.nanopay.tx.tp.alterna;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.tp.TxnProcessor;

public class AlternaTransactionDAO
  extends ProxyDAO
{
  public AlternaTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }
  public AlternaTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction txn = (Transaction) obj;

    //
    // NOTE: AlternaTransactionDAO should be last in the DAO pipe.
    // If the transaction hasn't been handled yet, then assigne
    // to Alterna.
    //
    if ( TxnProcessor.NONE.equals(txn.getTxnProcessorId()) ) {
      txn.setTxnProcessorId(TxnProcessor.ALTERNA);
    }
    return getDelegate().put_(x, txn);
  }
}
