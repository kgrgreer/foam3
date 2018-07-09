package net.nanopay.tx;

import foam.core.*;
import foam.dao.*;
import foam.nanos.auth.User;
import net.nanopay.account.CurrentBalance;
import net.nanopay.account.Balance;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/** Represents a transfer of assets from one account to another. **/
public class Transfer
  implements Comparable
{
  protected long    accountId_;
  protected long    amount_;
  protected User    user_    = null;
  protected Balance balance_ = null;
  protected String  currency_;

  public Transfer(long accountId, long amount, String currency) {
    accountId_ = accountId;
    amount_ = amount;
    currency_ = currency;
  }

  public Object getLock() {
    return String.valueOf(getAccountId()).intern();
  }

  public long getAccountId() {
    return accountId_;
  }

  public long getAmount() {
    return amount_;
  }

  public Balance getBalance() {
    return balance_;
  }

  public String getCurrency() { return currency_; }

  public int compareTo(Object other) {
    Transfer t2 = (Transfer) other;
    long     i1 = getAccountId();
    long     i2 = t2.getAccountId();

    return i1 == i2 ? 0 : i1 > i2 ? 1 : -1;
  }

  /** Validate that the user exists and has sufficient balance **/
  public void validate(X x)
    throws RuntimeException
  {
    DAO  userDAO = (DAO) x.get("localUserDAO");
    User user    = (User) userDAO.find(getAccountId());

    if ( user == null ) throw new RuntimeException("Uknown user " + getAccountId());

    user_ = user;

    DAO     balanceDAO = (DAO) x.get("localBalanceDAO");
    Balance balance    = (Balance) balanceDAO.find(EQ(Balance.ACCOUNT, getAccountId()));
    if ( balance == null ) {
      balance_ = new Balance();
      balance_.setAccount(getAccountId());
    } else {
      balance_ = balance;
    }
    if ( getAmount() < 0 ) {
      if ( -getAmount() > balance_.getBalance() ) {
        System.out.println("Transfer.validate user: "+getAccountId()+", amount: "+getAmount()+", balance: "+balance.getBalance());

        throw new RuntimeException("Insufficient balance in account " + getAccountId());
      }
    }
  }

  /** Execute the balance transfer, updating the user's balance. **/
  public void execute(X x) {
    DAO     balanceDAO = (DAO) x.get("localBalanceDAO");
    Balance balance  = getBalance();

    balance.setBalance(balance.getBalance() + getAmount());

    balanceDAO.put(balance);
  }
}
