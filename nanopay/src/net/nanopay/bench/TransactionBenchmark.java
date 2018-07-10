package net.nanopay.bench;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;
import net.nanopay.account.CurrentBalance;
import net.nanopay.tx.model.Transaction;
import net.nanopay.account.DigitalAccount;

import java.util.List;

public class TransactionBenchmark
  implements Benchmark
{
  List accounts = null;
  List currentBalances = null;

  protected DAO userDAO_;
  protected DAO currentBalanceDAO_;
  protected DAO transactionDAO_;

  @Override
  public void setup(X x) {
    userDAO_ = (DAO) x.get("localUserDAO");
    currentBalanceDAO_ = (DAO) x.get("localCurrentBalanceDAO");
    transactionDAO_ = (DAO) x.get("localTransactionDAO");

    Sink sink = new ArraySink();
    sink = userDAO_.select(sink);
    accounts = ((ArraySink) sink).getArray();

    sink = new ArraySink();
    sink = currentBalanceDAO_.select(sink);
    currentBalances = ((ArraySink) sink).getArray();

    for ( int i = 0 ; i < currentBalances.size() ; i++ ) {
      CurrentBalance currentBalance = (CurrentBalance) currentBalances.get(i);
      currentBalance.setBalance(1000000);
      currentBalanceDAO_.put(currentBalance);
    }

    for ( int i = 0 ; i < accounts.size() ; i++ ) {
      DigitalAccount user = (DigitalAccount) accounts.get(i);
      CurrentBalance currentBalance = (CurrentBalance) currentBalanceDAO_.find(user.getId());
      if ( currentBalance == null ) {
        currentBalance = new CurrentBalance();
        currentBalance.setId(user.getId());
        currentBalance.setBalance(1000000);
        currentBalanceDAO_.put(currentBalance);
      }
    }
  }

  @Override
  public void execute(X x) {
    int fi = (int) (Math.random() * accounts.size());
    int ti = (int) (Math.random() * accounts.size());
    int amount = (int) ((Math.random() + 0.1) * 10000);

    long destinationAccount = ((DigitalAccount) accounts.get(ti)).getId();
    long sourceAccount = ((DigitalAccount) accounts.get(fi)).getId();

    if ( sourceAccount != destinationAccount ) {
      Transaction transaction = new Transaction();
      transaction.setSourceAccount(sourceAccount);
      transaction.setDestinationAccount(destinationAccount);
      transaction.setAmount(amount);
      transactionDAO_.put(transaction);
    }
  }
}
