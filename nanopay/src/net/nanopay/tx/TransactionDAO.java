package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import java.util.Date;
import net.nanopay.model.Account;
import net.nanopay.model.UserAccountInfo;
import net.nanopay.tx.model.Transaction;

public class TransactionDAO
  extends ProxyDAO
{
  protected DAO userDAO_;
  protected DAO accountDAO_;

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
    transaction.setDate(new Date());

    long payeeId            = transaction.getPayeeId();
    long payerId            = transaction.getPayerId();

    if ( payerId <= 0 ) {
      throw new RuntimeException("Invalid Payer id");
    }

    if ( payeeId <= 0 ) {
      throw new RuntimeException("Invalid Payee id");
    }

    if ( payeeId == payerId ) {
      throw new RuntimeException("PayeeID and PayerID cannot be the same");
    }

    if ( transaction.getAmount() <= 0 ) {
      throw new RuntimeException("Transaction amount must be greater than 0");
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
            return fObject;
          } else {
            throw new RuntimeException("Payer doesn't have enough balance");
          }
        } catch (Exception e) {
          throw e;
        }
      }
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