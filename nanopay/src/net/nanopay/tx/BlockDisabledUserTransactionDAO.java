package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;

public class BlockDisabledUserTransactionDAO extends ProxyDAO {
  private static final String BLOCK_TRANSACTION = "Transaction: %d is blocked because the %s is disabled.";
  private DAO bareUserDAO_;

  public BlockDisabledUserTransactionDAO(X x, DAO delegate) {
    super(x, delegate);
    bareUserDAO_ = (DAO) x.get("bareUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction txn = (Transaction) obj;

    if (!checkAccountOwner(txn.findSourceAccount(x))) {
      blockTransaction(txn, "payer");
    }

    if (!checkAccountOwner(txn.findDestinationAccount(x))) {
      blockTransaction(txn, "payer");
    }

    return super.put_(x, obj);
  }

  private boolean checkAccountOwner(Account account) {
    if (account != null) {
      User user = (User) bareUserDAO_.find(account.getOwner());

      if (user != null) {
        return user.getEnabled();
      }
    }
    return true;
  }

  private void blockTransaction(Transaction transaction, String user) {
    throw new RuntimeException(
      String.format(BLOCK_TRANSACTION, transaction.getId(), user));
  }
}
