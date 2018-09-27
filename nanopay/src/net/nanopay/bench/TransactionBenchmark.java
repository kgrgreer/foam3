package net.nanopay.bench;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;
import net.nanopay.account.Balance;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.TransactionQuote;

import java.util.List;

import static foam.mlang.MLang.EQ;

public class TransactionBenchmark
  implements Benchmark
{
  List users = null;
  List balances = null;

  protected DAO userDAO_;
  protected DAO balanceDAO_;
  protected DAO transactionDAO_;
  protected DAO transactionQuotePlanDAO_;
  protected int STARTING_BALANCE = 1000000;

  @Override
  public void setup(X x) {
    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) return;

    userDAO_ = (DAO) x.get("localUserDAO");
    balanceDAO_ = (DAO) x.get("localBalanceDAO");
    transactionDAO_ = (DAO) x.get("localTransactionDAO");
    transactionQuotePlanDAO_ = (DAO) x.get("localTransactionQuotePlanDAO");

    // If we don't use users with verfied emails, the transactions won't go
    // through for those users.
    userDAO_ = userDAO_.where(EQ(User.EMAIL_VERIFIED, true));

    Sink sink = new ArraySink();
    sink = userDAO_.select(sink);
    users = ((ArraySink) sink).getArray();

    sink = new ArraySink();
    sink = balanceDAO_.select(sink);
    balances = ((ArraySink) sink).getArray();

    for ( int i = 0 ; i < balances.size() ; i++ ) {
      Balance balance = (Balance) balances.get(i);
      balance = (Balance) balance.fclone();
      balance.setBalance(STARTING_BALANCE);
      balanceDAO_.put(balance);
    }

    for ( int i = 0 ; i < users.size() ; i++ ) {
      User user = (User) users.get(i);
      user = (User) user.fclone();
      Balance balance =
          (Balance) balanceDAO_.find(user.getId());
      if ( balance == null ) {
        balance = new Balance();
        balance.setId(user.getId());
        balance.setBalance(STARTING_BALANCE);
        Balance result =
            (Balance) balanceDAO_.put(balance);
        assert result.getBalance() == STARTING_BALANCE : result.getBalance();
      }
    }
  }

  @Override
  public void execute(X x) {
    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) return;

    int fi = (int) (Math.random() * users.size());
    int ti = (int) (Math.random() * users.size());
    int amount = (int) ((Math.random() + 0.1) * 10000);

    long payeeId = ((User) users.get(ti)).getId();
    long payerId = ((User) users.get(fi)).getId();

    if ( payeeId != payerId ) {
      Transaction transaction = new Transaction();
      transaction.setPayeeId(payeeId);
      transaction.setPayerId(payerId);
      transaction.setAmount(amount);
      TransactionQuote quote = (TransactionQuote) transactionQuotePlanDAO_.put(new TransactionQuote.Builder(x).setRequestTransaction(transaction).build());
      transactionDAO_.put(quote.getPlan());
    }
  }
}
