package net.nanopay.tx;

import foam.core.*;
import foam.dao.*;
import foam.nanos.auth.User;
import net.nanopay.account.CurrentBalance;

/** Represents a transfer of assets from one account to another. **/
public class Transfer
  implements Comparable
{
  protected long    userId_;
  protected long    amount_;
  protected User    user_    = null;
  protected CurrentBalance currentBalance_ = null;

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

  public CurrentBalance getCurrentBalance() {
    return currentBalance_;
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

    DAO     currentBalanceDAO = (DAO) x.get("localCurrentBalanceDAO");
    CurrentBalance currentBalance  = (CurrentBalance) currentBalanceDAO.find(getUserId());

    currentBalance_ = currentBalance == null ? new CurrentBalance() : currentBalance;

    if ( getAmount() < 0 ) {
      if ( -getAmount() > currentBalance_.getBalance() ) {
        System.out.println("Transfer.validate user: "+getUserId()+", amount: "+getAmount()+", currentBalance: "+currentBalance.getBalance());

        throw new RuntimeException("Insufficient balance in account " + getUserId());
      }
    }
  }

  /** Execute the balance transfer, updating the user's balance. **/
  public void execute(X x) {
    DAO     currentBalanceDAO = (DAO) x.get("localCurrentBalanceDAO");
    CurrentBalance currentBalance  = getCurrentBalance();

    currentBalance.setBalance(currentBalance.getBalance() + getAmount());

    currentBalanceDAO.put(currentBalance);
  }
}
