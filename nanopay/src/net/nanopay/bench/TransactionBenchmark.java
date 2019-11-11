package net.nanopay.bench;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.ProxyDAO;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.mlang.sink.Count;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;
import foam.nanos.logger.Logger;
import net.nanopay.account.*;
import net.nanopay.bank.*;
import net.nanopay.payment.*;
import net.nanopay.model.*;
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
  protected DAO accountDAO_;
  protected DAO branchDAO_;
  protected DAO institutionDAO_;
  protected DAO transactionDAO_;
  protected DAO transactionQuotePlanDAO_;
  protected DAO userDAO_;
  protected Long STARTING_BALANCE = 100000L;
  protected String ADMIN_BANK_ACCOUNT_NUMBER = "2131412443534534";
  protected Boolean quote_ = true;

  public void setQuoteTransactions(Boolean quote) {
    quote_ = quote;
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
    DAO dao = (DAO) x.get("localTransactionDAO");
    Count count = (Count) dao.select(new Count());
    stats.put("Transactions (M)", (count.getValue() / 1000.0));
  }

  @Override
  public void setup(X x) {
    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) return;

    logger_ = (Logger) x.get("logger");
    logger_.info(this.getClass().getSimpleName(), "setup");
    System.gc();

    accountDAO_ = (DAO)x.get("localAccountDAO");
    branchDAO_ = (DAO)x.get("branchDAO");
    institutionDAO_ = (DAO)x.get("institutionDAO");
    transactionDAO_ = (DAO) x.get("localTransactionDAO");
    transactionQuotePlanDAO_ = (DAO) x.get("localTransactionQuotePlanDAO");
    userDAO_ = (DAO) x.get("localUserDAO");

    User admin = (User) userDAO_.find(1);

    DAO dao = accountDAO_.where(EQ(BankAccount.ACCOUNT_NUMBER,ADMIN_BANK_ACCOUNT_NUMBER)).limit(1);
    List banks = ((ArraySink) dao.select(new ArraySink())).getArray();
    BankAccount bank = null;
    if ( banks.size() == 1 ) {
      bank = (BankAccount) banks.get(0);
    } else {
      dao = institutionDAO_.where(EQ(Institution.INSTITUTION_NUMBER, "001")).limit(1);
      List institutions = ((ArraySink) dao.select(new ArraySink())).getArray();
      Institution institution = null;
      if ( institutions.size() == 1 ) {
        institution = (Institution) institutions.get(0);
      } else {
        institution = new Institution.Builder(x)
          .setCountryId("CAD")
          .setInstitutionNumber("001")
          .build();
        institution = (Institution) institutionDAO_.put_(x, institution);
      }

      dao = branchDAO_.where(EQ(Branch.BRANCH_ID, "12345")).limit(1);
      List branches = ((ArraySink) dao.select(new ArraySink())).getArray();
      Branch branch = null;
      if ( branches.size() == 1 ) {
        branch = (Branch) branches.get(0);
      } else {
        branch = new Branch.Builder(x)
          .setInstitution(institution.getId())
          .setBranchId("12345")
          .build();
        branch = (Branch) branchDAO_.put_(x, branch);
      }

      bank = new CABankAccount();
      bank.setName(ADMIN_BANK_ACCOUNT_NUMBER);
      bank.setBranch(branch.getId());
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
    users = ((ArraySink) userDAO_.select(new ArraySink())).getArray();

    // initial funding of system.
    DigitalAccount adminDCA = DigitalAccount.findDefault(x, admin, "CAD");
    Transaction ci = (Transaction) new AlternaCITransaction();
    ci.setSourceAccount(bank.getId());
    ci.setDestinationAccount(adminDCA.getId());
    ci.setAmount(Long.valueOf(users.size()) * STARTING_BALANCE);
    ci.setStatus(TransactionStatus.COMPLETED);
    transactionDAO_.put_(x, ci);
    Long bal = (Long) adminDCA.findBalance(x);
    assert bal >= Long.valueOf(users.size()) * STARTING_BALANCE;
    // distribute the funds to all user digital accounts
    for ( int i = 0 ; i < users.size() ; i++ ) {
      User user = (User) users.get(i);
      user = (User) user.fclone();
      DigitalAccount account = DigitalAccount.findDefault(x, user, "CAD");
      Transaction txn = (Transaction) new DigitalTransaction();
      txn.setSourceAccount(adminDCA.getId());
      txn.setDestinationAccount(account.getId());
      txn.setAmount(STARTING_BALANCE);
      txn.setIsQuoted(true);
      transactionDAO_.put(txn);
      Long balance = (Long) account.findBalance(x);
      assert balance >= STARTING_BALANCE;
      break;
    }
  }

  @Override
  public void execute(X x) {
    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) return;

    int fi = (int) (Math.random() * users.size());
    int ti = (int) (Math.random() * users.size());
    int amount = (int) ((Math.random() + 0.1) * 100);

    User payer = (User) users.get(fi);
    long payerId = ((User) users.get(fi)).getId();

    User payee = (User) users.get(ti);
    long payeeId = ((User) users.get(ti)).getId();

    if ( payeeId != payerId ) {
      Transaction transaction = new Transaction();
      transaction.setPayeeId(payeeId);
      transaction.setPayerId(payerId);
      transaction.setAmount(amount);

      if ( quote_ ) {
        TransactionQuote quote = (TransactionQuote) transactionQuotePlanDAO_.put(new TransactionQuote.Builder(x).setRequestTransaction(transaction).build());
        transaction = quote.getPlan();
      } else {
        Account payerAccount = DigitalAccount.findDefault(x, payer, "CAD");
        Account payeeAccount = DigitalAccount.findDefault(x, payee, "CAD");
        transaction.setSourceAccount(payerAccount.getId());
        transaction.setDestinationAccount(payeeAccount.getId());
        transaction.setIsQuoted(true);
      }

      try {
        transactionDAO_.put(transaction);
      } catch (RuntimeException e) {
        System.out.println(e.getMessage());
        logger_.warning(e.getMessage());
      }
    }
  }
}
