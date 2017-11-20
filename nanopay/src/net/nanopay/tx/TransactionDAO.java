package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import java.util.Date;
import net.nanopay.model.Account;
import net.nanopay.tx.model.Transaction;

public class TransactionDAO
    extends ProxyDAO
{
  protected DAO userDAO_;
  protected DAO accountDAO_;
  protected DAO transactionErrorDAO_;

  public TransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }
  public TransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  protected DAO getUserDAO() {
    if ( userDAO_ == null ) {
      userDAO_ = (DAO) getX().get("localUserDAO");
    }
    return userDAO_;
  }

  protected DAO getAccountDAO() {
    if ( accountDAO_ == null ) {
      accountDAO_ = (DAO) getX().get("localAccountDAO");
    }
    return accountDAO_;
  }

  protected DAO getTransactionErrorDAO() {
    if ( transactionErrorDAO_ == null ) {
      transactionErrorDAO_ = (DAO) getX().get("transactionErrorDAO");
    }
    return transactionErrorDAO_;
  }

  protected Account createNewAccount(long id) {
    Account account = new Account();
    account.setId(id);
    account.setBalance(0);
    return account;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    try {
      Transaction transaction = (Transaction) obj;
      transaction.setDate(new Date());

      long payeeId = transaction.getPayeeId();
      long payerId = transaction.getPayerId();

      if (payerId <= 0) {
        throw new RuntimeException("Invalid Payer id");
      }

      if (payeeId <= 0) {
        throw new RuntimeException("Invalid Payee id");
      }

      if (payeeId == payerId) {
        throw new RuntimeException("PayeeID and PayerID cannot be the same");
      }

      if (transaction.getAmount() <= 0) {
        throw new RuntimeException("Transaction amount must be greater than 0");
      }

      Long firstLock = payerId < payeeId ? transaction.getPayerId() : transaction.getPayeeId();
      Long secondLock = payerId > payeeId ? transaction.getPayerId() : transaction.getPayeeId();

      synchronized (firstLock) {
        synchronized (secondLock) {
          User payee = (User) getUserDAO().find(transaction.getPayeeId());
          User payer = (User) getUserDAO().find(transaction.getPayerId());

          if (payee == null || payer == null) {
            throw new RuntimeException("Users not found");
          }

          Account payeeAccount = (Account) getAccountDAO().find(payee.getId());
          if (payeeAccount == null) {
            payeeAccount = createNewAccount(payee.getId());
          }

          Account payerAccount = (Account) getAccountDAO().find(payer.getId());
          if (payerAccount == null) {
            payerAccount = createNewAccount(payer.getId());
          }

          long amount = transaction.getAmount();
          if (payerAccount.getBalance() < amount) {
            throw new RuntimeException("You do not have enough money in your account");
          }

          payerAccount.setBalance(payerAccount.getBalance() - amount);
          payeeAccount.setBalance(payeeAccount.getBalance() + amount);
          getAccountDAO().put(payerAccount);
          getAccountDAO().put(payeeAccount);
          return super.put_(x, obj);
        }
      }
    } finally {
      getTransactionErrorDAO().put(obj);
    }
  }

  @Override
  public FObject remove_(X x, FObject fObject) {
    return null;
  }

  @Override
  public FObject find_(X x, Object o) {
    return super.find_(x, o);
  }
}