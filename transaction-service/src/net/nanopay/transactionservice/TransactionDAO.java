package net.nanopay.transactionservice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.MapDAO;
import foam.nanos.auth.User;
import net.nanopay.common.model.Account;
import net.nanopay.common.model.UserAccountInfo;
import net.nanopay.transactionservice.model.Transaction;

public class TransactionDAO
    extends MapDAO
{
  protected DAO userDAO_;
  protected DAO accountDAO_;

  public TransactionDAO(X x) {
    this.setX(x);
    this.setOf(net.nanopay.transactionservice.model.Transaction.getOwnClassInfo());
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

  protected Account createNewAccount(long id) {
    Account account = new Account();
    account.setId(id);
    UserAccountInfo userAccountInfo = new UserAccountInfo();
    userAccountInfo.setBalance(0);
    account.setAccountInfo(userAccountInfo);
    return account;
  }

  @Override
  public FObject put_(X x, FObject fObject) throws RuntimeException {
    Transaction transaction = (Transaction) fObject;
    long payeeId            = transaction.getPayeeId();
    long payerId            = transaction.getPayerId();

    if ( transaction.getAmount() <= 0 ) {
      throw new RuntimeException("Transaction amount must be greater than 0");
    }

    if ( payeeId == payerId ) {
      throw new RuntimeException("PayeeID and PayerID cannot be the same");
    }

    Long firstLock  = payerId < payeeId ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = payerId > payeeId ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          User payee = (User) getUserDAO().find(transaction.getPayeeId());
          User payer = (User) getUserDAO().find(transaction.getPayerId());

          if ( payee == null || payer == null ) {
            throw new RuntimeException("Users not found");
          }

          Account payeeAccount = (Account) getAccountDAO().find(payee.getId());
          if ( payeeAccount == null ) {
            payeeAccount = createNewAccount(payee.getId());
          }

          Account payerAccount = (Account) getAccountDAO().find(payer.getId());
          if ( payerAccount == null ) {
            payerAccount = createNewAccount(payer.getId());
          }

          long amount = transaction.getAmount();
          UserAccountInfo payerAccountInfo = (UserAccountInfo) payerAccount.getAccountInfo();
          UserAccountInfo payeeAccountInfo = (UserAccountInfo) payeeAccount.getAccountInfo();

          if ( payerAccountInfo.getBalance() >= amount ) {
            payerAccountInfo.setBalance(payerAccountInfo.getBalance() - amount);
            payeeAccountInfo.setBalance(payeeAccountInfo.getBalance() + amount);

            payerAccount.setAccountInfo(payerAccountInfo);
            payeeAccount.setAccountInfo(payeeAccountInfo);

            getAccountDAO().put(payerAccount);
            getAccountDAO().put(payeeAccount);

            super.put_(x, fObject);
          } else {
            throw new RuntimeException("Payer doesn't have enough balance");
          }
        } catch (Exception err) {
          err.printStackTrace();
        }
      }
    }
    return fObject;
  }

  @Override
  public FObject remove_(X x, FObject fObject) {
    return null;
  }

  @Override
  public FObject find_(X x, Object o) {
    return null;
  }
}