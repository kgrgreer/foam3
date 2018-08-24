package net.nanopay.tx;

import foam.core.X;
import foam.nanos.logger.Logger;
import net.nanopay.account.Balance;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/** Represents a transfer of assets from one account to another. **/
public class Transfer
  implements Comparable
{
  protected long    accountId_;
  protected long    amount_;
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

  public int compareTo(Object other) {
    Transfer t2 = (Transfer) other;
    long     i1 = getAccountId();
    long     i2 = t2.getAccountId();

    return i1 == i2 ? 0 : i1 > i2 ? 1 : -1;
  }

  /** Validate that the user exists and has sufficient balance **/
  public void validate(X x, Balance balance)
    throws RuntimeException
  {
    if ( getAmount() < 0 ) {
      if ( -getAmount() > balance.getBalance() ) {
        ((Logger) x.get("logger")).debug("Transfer.validate account:", getAccountId(), "amount:", getAmount(), "balance:", balance.getBalance());
        throw new RuntimeException("Insufficient balance in account " + getAccountId());
      }
    }
  }

  /** Execute the balance transfer, updating the user's balance. **/
  public void execute(X x, Balance balance) {
    balance.setBalance(balance.getBalance() + getAmount());
  }
}
