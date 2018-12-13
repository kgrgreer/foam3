package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.tx.model.Transaction;

public class BlockDisabledUserTransactionDAO extends ProxyDAO {
  private static final String BLOCK_TRANSACTION = "Transaction: %d is blocked because the %s is disabled.";

  public BlockDisabledUserTransactionDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction txn = (Transaction) obj;
    User payer = txn.findSourceAccount(x).findOwner(x);
    User payee = txn.findDestinationAccount(x).findOwner(x);

    if (!payer.getEnabled()) {
      blockTransaction(txn, "payer");
    }

    if (!payee.getEnabled()) {
      blockTransaction(txn, "payee");
    }

    return super.put_(x, obj);
  }

  private void blockTransaction(Transaction transaction, String user) {
    throw new RuntimeException(
      String.format(BLOCK_TRANSACTION, transaction.getId(), user));
  }
}
