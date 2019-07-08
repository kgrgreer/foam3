package net.nanopay.bench;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;
import foam.nanos.logger.Logger;
import net.nanopay.account.*;
import net.nanopay.bank.*;
import net.nanopay.tx.model.*;
import net.nanopay.tx.*;
import net.nanopay.tx.alterna.*;

import java.util.List;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.NEQ;
import static foam.mlang.MLang.GT;

public class TransactionBenchmark
  implements Benchmark
{
  List users = null;

  protected Logger logger_;
  protected DAO userDAO_;
  protected DAO transactionDAO_;
  protected DAO transactionQuotePlanDAO_;
  protected DAO accountDAO_;
  protected int STARTING_BALANCE = 1000000;
  protected String ADMIN_BANK_ACCOUNT_NUMBER = "2131412443534534";

  @Override
  public void setup(X x) {
    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) return;

    logger_ = (Logger) x.get("logger");
    userDAO_ = (DAO) x.get("localUserDAO");
    transactionDAO_ = (DAO) x.get("localTransactionDAO");
    transactionDAO_.removeAll();
    transactionQuotePlanDAO_ = (DAO) x.get("localTransactionQuotePlanDAO");
    accountDAO_ = (DAO)x.get("localAccountDAO");

    User admin = (User) userDAO_.find(1);

    DAO dao = accountDAO_.where(EQ(BankAccount.ACCOUNT_NUMBER,ADMIN_BANK_ACCOUNT_NUMBER)).limit(1);
    Sink sink = new ArraySink();
    sink = dao.select(sink);
    List banks = ((ArraySink) sink).getArray();
    logger_.info("TransactionBenchmark", "banks", banks.size());
    BankAccount bank = null;
    if ( banks.size() == 1 ) {
      bank = (BankAccount) banks.get(0);
    } else {
      bank = new CABankAccount();
      bank.setName(ADMIN_BANK_ACCOUNT_NUMBER);
      bank.setAccountNumber(ADMIN_BANK_ACCOUNT_NUMBER);
      bank.setOwner(admin.getId());
      bank.setStatus(BankAccountStatus.VERIFIED);
      accountDAO_.put_(x, bank);
    }

    for ( int i = 1; i < 101; i++ ) {
      User user = null;
      int id = 10000 + i;
      user = (User) userDAO_.find(id);
      if ( user == null ) {
        user = new User();
        user.setId(id);
        String s = String.valueOf(id);
        user.setFirstName("k");
        user.setLastName("s");
        user.setEmail(s+"@nanopay.net");
        user.setEmailVerified(true);
        user.setGroup("nanopay");
        userDAO_.put(user);
      }
    }

    // If we don't use users with verfied emails, the transactions won't go
    // through for those users.
    userDAO_ = userDAO_.where(AND(EQ(User.EMAIL_VERIFIED, true), GT(User.ID, 10000)));

    sink = new ArraySink();
    sink = userDAO_.select(sink);
    users = ((ArraySink) sink).getArray();
    logger_.info("TransactionBenchmark", "users", users.size());

    // initial funding of system.
    DigitalAccount adminDCA = DigitalAccount.findDefault(x, admin, "CAD");
    Transaction ci = (Transaction) new AlternaCITransaction();
    ci.setSourceAccount(bank.getId());
    ci.setDestinationAccount(adminDCA.getId());
    ci.setAmount(users.size() * STARTING_BALANCE);
    ci.setStatus(TransactionStatus.COMPLETED);
    transactionDAO_.put(ci);
    Long bal = (Long) adminDCA.findBalance(x);
    assert bal >= users.size() * STARTING_BALANCE;

    // distribute the funds to all user digital accounts
    for ( int i = 0 ; i < users.size() ; i++ ) {
      User user = (User) users.get(i);
      user = (User) user.fclone();
      DigitalAccount account = DigitalAccount.findDefault(x, user, "CAD");
      Transaction txn = (Transaction) new DigitalTransaction();
      txn.setSourceAccount(adminDCA.getId());
      txn.setDestinationAccount(account.getId());
      txn.setAmount(STARTING_BALANCE);
      transactionDAO_.put(txn);
      Long balance = (Long) account.findBalance(x);
      assert balance >= STARTING_BALANCE;
    }
  }

  @Override
  public void execute(X x) {
    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) return;

    int fi = (int) (Math.random() * users.size());
    int ti = (int) (Math.random() * users.size());
    int amount = (int) ((Math.random() + 0.1) * 100);

    long payeeId = ((User) users.get(ti)).getId();
    long payerId = ((User) users.get(fi)).getId();

    if ( payeeId != payerId ) {
      Transaction transaction = new Transaction();
      transaction.setPayeeId(payeeId);
      transaction.setPayerId(payerId);
      transaction.setAmount(amount);
      TransactionQuote quote = (TransactionQuote) transactionQuotePlanDAO_.put(new TransactionQuote.Builder(x).setRequestTransaction(transaction).build());
      try {
        transactionDAO_.put(quote.getPlan());
      }
      catch (Exception e) {
        System.out.println(e.getMessage());
      }
    }
  }
}
