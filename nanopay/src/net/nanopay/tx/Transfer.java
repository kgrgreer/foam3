package net.nanopay.tx;

import foam.core.*;
import foam.dao.*;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.account.Balance;
import net.nanopay.account.Balance;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/** Represents a transfer of assets from one account to another. **/
public class Transfer
  implements Comparable
{
  protected long    accountId_;
  protected long    amount_;
  protected Account    account_    = null;
  protected Balance balance_ = null;
  protected String  currency_;

  public Transfer(long accountId, long amount) {
    accountId_ = accountId;
    amount_ = amount;
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


  public int compareTo(Object other) {
    Transfer t2 = (Transfer) other;
    long     i1 = getAccountId();
    long     i2 = t2.getAccountId();

    return i1 == i2 ? 0 : i1 > i2 ? 1 : -1;
  }


  /** Execute the balance transfer, updating the user's balance. **/
  public void execute(X x) {
    DAO     balanceDAO = (DAO) x.get("localBalanceDAO");
    Balance balance  = (Balance) balanceDAO.find(getAccountId());
    if ( balance == null ) {
      balance = new Balance();
      balance.setAccount(getAccountId());
      balance.setBalance(getAmount());
    } else {
      balance.setBalance(balance.getBalance() + getAmount());
    }

    balanceDAO.put(balance);
  }
}
