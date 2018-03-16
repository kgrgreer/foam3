package net.nanopay.tx;

import foam.core.*;
import foam.dao.*;
import foam.nanos.auth.User;
import net.nanopay.model.Account;

public class Transfer
  implements Comparable
{
  protected long    userId_;
  protected long    amount_;
  protected User    user_    = null;
  protected Account account_ = null;

  public Transfer(long userId, long amount) {
    userId_ = userId;
    amount_ = amount;
  }

  public Object getLock() {
    return String.valueOf(getUserId()).intern();
  }

  public long getUserId() {
    return userId_;
  }

  public long getAmount() {
    return amount_;
  }

  public Account getAccount() {
    return account_;
  }

  public int compareTo(Object other) {
    Transfer t2 = (Transfer) other;
    long     i1 = getUserId();
    long     i2 = t2.getUserId();

    return i1 == i2 ? 0 : i1 > i2 ? 1 : -1;
  }

  /** Validate that the user exists and has sufficient balance **/
  public void validate(X x)
    throws RuntimeException
  {
    DAO  userDAO = (DAO) x.get("localUserDAO");
    User user    = (User) userDAO.find(getUserId());

    if ( user == null ) throw new RuntimeException("Uknown user " + getUserId());

    user_ = user;

    DAO     accountDAO = (DAO) x.get("localAccountDAO");
    Account account    = (Account) accountDAO.find(getUserId());

    account_ = account == null ? new Account() : account;

    if ( getAmount() < 0 ) {
      if ( -getAmount() > account_.getBalance() ) throw new RuntimeException("Insufficient balance in account " + getUserId());
    }
  }

  /** Execute the balance transfer, updating the user's balance. **/
  public void execute(X x) {
    DAO     accountDAO = (DAO) x.get("localAccountDAO");
    Account account    = getAccount();

    account.setBalance(account.getBalance() + getAmount());

    accountDAO.put(account);
  }
}
