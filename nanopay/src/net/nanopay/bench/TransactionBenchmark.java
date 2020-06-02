package net.nanopay.bench;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.GT;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.sink.Count;
import foam.nanos.boot.NSpec;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;
import foam.nanos.auth.LifecycleState;
import foam.nanos.logger.Logger;
import foam.nanos.ruler.RuleGroup;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.TrustAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.model.Branch;
import net.nanopay.payment.Institution;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.alterna.AlternaCITransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class TransactionBenchmark
  implements Benchmark
{
  protected List users_ = null;
  protected Map accounts_ = new HashMap();
  protected Logger logger_;
  protected DAO accountDAO_;
  protected DAO branchDAO_;
  protected DAO institutionDAO_;
  protected DAO ruleGroupDAO_;
  protected DAO transactionDAO_;
  protected DAO transactionPlannerDAO;
  protected DAO userDAO_;
  protected Long MAX_USERS = 100L;
  protected Long STARTING_BALANCE = 100000L;
  protected Boolean quote_ = false;
  protected Boolean purge_ = true;
  protected Boolean disableRules_ = false;

  // Alterna
  //  protected Long INSTITUTION_ID = 24L;
  protected String INSTITUTION_NUMBER = "123";
  //  protected Long BRANCH_ID = 1L;
  protected String BRANCH_NUMBER = "12345";
  protected Long RESERVE_ACCOUNT_ID = 7L;
  protected String RESERVE_ACCOUNT_NUMBER = "2131412443534534";
  protected Long TRUST_ID = 1L;

  public void setQuoteTransactions(Boolean quote) {
    quote_ = quote;
  }

  public void setPurgePerRun(Boolean purge) {
    purge_ = purge;
  }

  public void setDisableRules(Boolean rules) {
    disableRules_ = rules;
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
    Logger logger = (Logger) x.get("logger");
    DAO dao = (DAO) x.get("localTransactionDAO");
    Count txns = (Count) dao.select(new Count());
    stats.put("Transactions (M)", (txns.getValue() / 1000.0));

    // dump all dao sizes - looking for memory leak
    StringBuilder sb = new StringBuilder();
    sb.append("DAO Counts,");
    sb.append(stats.get(foam.nanos.bench.BenchmarkRunner.RUN));
    sb.append(System.getProperty("line.separator"));
    sb.append("DAO, Count");
    sb.append(System.getProperty("line.separator"));

    List nspecs = ((ArraySink) ((DAO) x.get("nSpecDAO")).select(new ArraySink())).getArray();
    for ( Object n : nspecs ) {
      NSpec nspec = (NSpec) n;
      if ( nspec.getName().indexOf("DAO") == -1 ||
           nspec.getName().toLowerCase().indexOf("user") > 0 ) {
        continue;
      }
      try {
        Count count = (Count) ((DAO) x.get(nspec.getName())).select(new Count());
        if ( count.getValue() > 0 ) {
          sb.append(nspec.getName());
          sb.append(",");
          sb.append(count.getValue());
          sb.append(System.getProperty("line.separator"));
        }
      } catch (Throwable t) {
        // nop
      }
    }
    logger.info(this.getClass().getSimpleName(), "teardown", "counts", sb.toString());

    if ( purge_ ) {
      while ( dao != null &&
              !  ( dao instanceof foam.dao.NullDAO ) ) {
        if ( dao instanceof foam.dao.MDAO ) {
          foam.dao.MDAO mdao = (foam.dao.MDAO) dao;
          Count before = (Count) mdao.select(new Count());
          mdao.removeAll();
          Count after = (Count) mdao.select(new Count());
          logger.info(this.getClass().getSimpleName(), "teardown", "purge", (before.getValue() - after.getValue()));
          break;
        } else if ( dao instanceof foam.dao.ProxyDAO ) {
          dao = ((foam.dao.ProxyDAO) dao).getDelegate();
        } else {
          logger.info(this.getClass().getSimpleName(), "teardown", "purge", "FAILED");
          break;
        }
      }
    }
  }

  @Override
  public void setup(X x) {
    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) return;

    logger_ = (Logger) x.get("logger");
    logger_.info(this.getClass().getSimpleName(), "setup");
    System.gc();

    accountDAO_ = (DAO) x.get("localAccountDAO");
    branchDAO_ = (DAO) x.get("branchDAO");
    institutionDAO_ = (DAO) x.get("institutionDAO");
    ruleGroupDAO_ = (DAO) x.get("ruleGroupDAO");
    transactionDAO_ = (DAO) x.get("localTransactionDAO");
    transactionPlannerDAO = (DAO) x.get("localTransactionPlannerDAO");
    userDAO_ = (DAO) x.get("localUserDAO");

    User admin = (User) userDAO_.find(1L);

    BankAccount bank = (BankAccount) accountDAO_.find(RESERVE_ACCOUNT_ID);
    if ( bank == null ) {
    //   Institution institution = (Institution) institutionDAO_.find(INSTITUTION_ID);
    //   if ( institution == null ) {
    //     institution = new Institution.Builder(x)
    //       .setId(INSTITUTION_ID)
    //       .setCountryId("CA")
    //       .setInstitutionNumber(INSTITUTION_NUMBER)
    //       .build();
    //     institution = (Institution) institutionDAO_.put_(x, institution);
    //   }

    //   Branch branch = (Branch) branchDAO_.find(BRANCH_ID);
    //   if ( branch == null ) {
    //     branch = new Branch.Builder(x)
    //       .setId(BRANCH_ID)
    //       .setInstitution(institution.getId())
    //       .setBranchId(BRANCH_NUMBER)
    //       .build();
    //     branch = (Branch) branchDAO_.put_(x, branch);
    //   }

      bank = new CABankAccount();
      bank.setId(RESERVE_ACCOUNT_ID);
      bank.setName("Reserve");
      //      bank.setBranch(branch.getId());
      bank.setInstitutionNumber(INSTITUTION_NUMBER);
      bank.setBranchId(BRANCH_NUMBER);
      bank.setAccountNumber(RESERVE_ACCOUNT_NUMBER);
      bank.setOwner(admin.getId());
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank.setLifecycleState(LifecycleState.ACTIVE);
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank = (BankAccount) accountDAO_.put_(x, bank);
    }

    if ( bank.getStatus() != BankAccountStatus.VERIFIED ) {
      bank = (BankAccount) bank.fclone();
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank = (BankAccount) accountDAO_.put_(x, bank);
    }

    TrustAccount trust = (TrustAccount) accountDAO_.find(TRUST_ID);
    if ( trust == null ) {
      trust = new TrustAccount();
      trust.setId(TRUST_ID);
      trust.setReserveAccount(bank.getId());
      trust.setLifecycleState(LifecycleState.ACTIVE);
      trust = (TrustAccount) accountDAO_.put(trust);
    }

    for ( long i = 1; i <= MAX_USERS; i++ ) {
      User user = null;
      long id = 10000 + i;
      user = (User) userDAO_.find(id);
      if ( user == null ) {
        user = new User();
        user.setId(id);
        String s = String.valueOf(id);
        user.setFirstName("k");
        user.setLastName("s");
        user.setEmail(s+"@nanopay.net");
        user.setEmailVerified(true);
        // NOTE: use 'sme' group so default digital account is created below.
        user.setGroup("sme");
        user.setLifecycleState(LifecycleState.ACTIVE);
        user = (User) userDAO_.put(user);
      }
    }

    // If we don't use users with verfied emails, the transactions won't go
    // through for those users.
    userDAO_ = userDAO_.where(AND(EQ(User.EMAIL_VERIFIED, true), GT(User.ID, 10000)));
    users_ = ((ArraySink) userDAO_.select(new ArraySink())).getArray();

    RuleGroup rg = (RuleGroup) ruleGroupDAO_.find("genericPlanner").fclone();
    rg.setEnabled(true);
    ruleGroupDAO_.put(rg);

    // initial funding of system.
    DigitalAccount adminDCA = DigitalAccount.findDefault(x, admin, "CAD");
    //    Transaction ci = (Transaction) new AlternaCITransaction();
    Transaction ci = (Transaction) new Transaction();
    ci.setSourceAccount(bank.getId());
    ci.setDestinationAccount(adminDCA.getId());
    ci.setAmount(Long.valueOf(users_.size()) * STARTING_BALANCE);
    //    ci.setStatus(TransactionStatus.COMPLETED);
    //    ci.setIsQuoted(true);
    //    ci.setPlanner("68afcf0c-c718-98f8-0841-75e97a3ad16d182");
    ci = (Transaction) transactionDAO_.put_(x, ci).fclone();
    //    ci.setStatus(TransactionStatus.COMPLETED);
    //    ci = (Transaction) transactionDAO_.put_(x, ci).fclone();
    Long bal = (Long) adminDCA.findBalance(x);
    assert bal >= Long.valueOf(users_.size()) * STARTING_BALANCE;

    // distribute the funds to all user digital accounts
    for ( int i = 0 ; i < users_.size() ; i++ ) {
      User user = (User) users_.get(i);
      //user = (User) user.fclone();
      DigitalAccount account = DigitalAccount.findDefault(x, user, "CAD");
      accounts_.put(i, account);
      //      Transaction txn = (Transaction) new DigitalTransaction();
      Transaction txn = (Transaction) new Transaction();
      txn.setSourceAccount(adminDCA.getId());
      txn.setDestinationAccount(account.getId());
      txn.setAmount(STARTING_BALANCE);
      //      txn.setIsQuoted(true);
      //      txn.setPlanner("68afcf0c-c718-98f8-0841-75e97a3ad16d182");
      transactionDAO_.put(txn);
      Long balance = (Long) account.findBalance(x);
      assert balance >= STARTING_BALANCE;
    }

    if ( disableRules_ ) {
      DAO ruleDAO = (DAO) x.get("ruleDAO");
      List rules = ((ArraySink) ruleDAO.select(new ArraySink())).getArray();
      for ( Object r : rules ) {
        foam.nanos.ruler.Rule rule = (foam.nanos.ruler.Rule) ((foam.core.FObject)r).fclone();
        rule.setEnabled(false);
        try {
          ruleDAO.put(rule);
        } catch ( Exception e ) {
          logger_.error("failed to disable rule:", rule);
        }
      }
    }
  }

  @Override
  public void execute(X x) {
    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) return;

    int fi = (int) (Math.random() * users_.size());
    int ti = (int) (Math.random() * users_.size());
    long amount = (long) ((Math.random() + 0.1) * 100);

    User payer = (User) users_.get(fi);
    long payerId = ((User) users_.get(fi)).getId();

    User payee = (User) users_.get(ti);
    long payeeId = ((User) users_.get(ti)).getId();

    if ( payeeId != payerId ) {
      Transaction transaction = new Transaction();
      transaction.setPayeeId(payeeId);
      transaction.setPayerId(payerId);
      transaction.setAmount(amount);
      transaction.setLifecycleState(LifecycleState.ACTIVE);

      if ( quote_ ) {
        TransactionQuote quote = (TransactionQuote) transactionPlannerDAO.put(new TransactionQuote.Builder(x).setRequestTransaction(transaction).build());
        transaction = quote.getPlan();
      } else {
        Account payerAccount = (DigitalAccount) accounts_.get(fi);
        Account payeeAccount = (DigitalAccount) accounts_.get(ti);
        transaction.setSourceAccount(payerAccount.getId());
        transaction.setDestinationAccount(payeeAccount.getId());
        transaction.setIsQuoted(true);
        transaction.setPlanner("68afcf0c-c718-98f8-0841-75e97a3ad16d182");
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
