/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.tx.bench;

import java.util.*;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.sink.Count;
import foam.nanos.boot.NSpec;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;
import foam.nanos.auth.LifecycleState;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;
import foam.nanos.ruler.Rule;
import foam.nanos.ruler.RuleGroup;
import foam.nanos.pm.PM;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.TrustAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.tx.planner.AbstractTransactionPlanner;
import net.nanopay.tx.planner.DigitalTransactionPlanner;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.planner.PlannerGroup;

import static foam.mlang.MLang.*;

/*
This script does the following operations:
SETUP
- create the amount of users
- create an account for each user
- create a bank account, and load each user's account
- set specific planners, and optionally disable rules

EXECUTION
- Make a transaction for random amount between 2 random users
- Plan and execute the transaction.

CLEANUP
- timing and DAO counts
- set planners back to original state
 */
public class TransactionBenchmark
  implements Benchmark
{
  protected List users_ = null;
  protected Map accounts_ = new HashMap();
  protected Logger logger_;
  protected DAO accountDAO_;
  protected DAO ruleDAO_;
  protected DAO ruleGroupDAO_;
  protected DAO transactionDAO_;
  protected DAO plannerDAO_;
  protected DAO userDAO_;
  protected Long MAX_USERS = 100L;
  protected Long STARTING_BALANCE = 100000L;
  protected String ADMIN_BANK_ACCOUNT_NUMBER = "2131412443534534";
  protected Boolean purge_ = true;
  protected Boolean disableRules_ = false;
  protected List<String> plannerGroups_ = new ArrayList<>();

  public void setPurgePerRun(Boolean purge) {
    purge_ = purge;
  }

  public void setDisableRules(Boolean rules) {
    disableRules_ = rules;
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
    logger_.info("teardown");
    DAO dao = (DAO) x.get("localTransactionDAO");
    Count txns = (Count) dao.select(new Count());
    stats.put("Transactions (M)", (txns.getValue() / 1000000.0));

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
    logger_.info("teardown", "counts", sb.toString());

    if ( purge_ ) {
      while ( dao != null &&
              !  ( dao instanceof foam.dao.NullDAO ) ) {
        if ( dao instanceof foam.dao.MDAO ) {
          foam.dao.MDAO mdao = (foam.dao.MDAO) dao;
          Count before = (Count) mdao.select(new Count());
          mdao.removeAll();
          Count after = (Count) mdao.select(new Count());
          logger_.info("teardown", "purge", (before.getValue() - after.getValue()));
          break;
        } else if ( dao instanceof foam.dao.ProxyDAO ) {
          dao = ((foam.dao.ProxyDAO) dao).getDelegate();
        } else {
          logger_.info("teardown", "purge", "FAILED");
          break;
        }
      }
    }
    // clean up planners
    PlannerGroup pg = (PlannerGroup) ruleGroupDAO_.find("benchmark").fclone();
    pg.setEnabled(false);
    ruleGroupDAO_.put(pg);
    for (String groupName : plannerGroups_) {
      PlannerGroup p = (PlannerGroup) (ruleGroupDAO_.find(groupName).fclone());
      p.setEnabled(true);
      ruleGroupDAO_.put(p);
    }
  }

  @Override
  public void setup(X x) {
    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) return;

    logger_ = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName()
      }, (Logger) x.get("logger"));

    logger_.info("setup");
    System.gc();
    ruleDAO_ = (DAO) x.get("ruleDAO");
    ruleGroupDAO_ = (DAO) x.get("ruleGroupDAO");
    accountDAO_ = (DAO)x.get("localAccountDAO");
    transactionDAO_ = (DAO) x.get("localTransactionDAO");
    plannerDAO_ = (DAO) x.get("localTransactionPlannerDAO");
    userDAO_ = (DAO) x.get("localUserDAO");

    User admin = (User) userDAO_.find(1L);

    DAO dao = accountDAO_.where(EQ(BankAccount.ACCOUNT_NUMBER,ADMIN_BANK_ACCOUNT_NUMBER)).limit(1);
    List banks = ((ArraySink) dao.select(new ArraySink())).getArray();
    BankAccount bank = null;
    if ( banks.size() == 1 ) {
      bank = (BankAccount) banks.get(0);
    } else {
      bank = new BankAccount();
      bank.setName(ADMIN_BANK_ACCOUNT_NUMBER);
      bank.setDenomination("CAD");
      bank.setAccountNumber(ADMIN_BANK_ACCOUNT_NUMBER);
      bank.setOwner(admin.getId());
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank = ((BankAccount) accountDAO_.put_(x, bank));
    }

    for ( long i = 1; i <= MAX_USERS; i++ ) {
      User user;
      long id = 10000 + i;
      user = (User) userDAO_.find(id);
      if ( user == null ) {
        user = new User();
        user.setId(id);
        String s = String.valueOf(id);
        user.setFirstName("Teddy");
        user.setLastName("Tester");
        user.setEmail(s+"@nanopay.net");
        user.setEmailVerified(true);
        // NOTE: use 'business' group so default digital account is created below.
        user.setGroup("business");
        userDAO_.put(user);
      }
    }

    // If we don't use users with verfied emails, the transactions won't go
    // through for those users.
    userDAO_ = userDAO_.where(AND(EQ(User.EMAIL_VERIFIED, true), EQ(User.LAST_NAME,"Tester"), GT(User.ID, 10000)));
    users_ = ((ArraySink) userDAO_.select(new ArraySink())).getArray();

    // optimize planners
    boolean plannerFound = false;
    List pgs = ((ArraySink) ruleGroupDAO_.where(INSTANCE_OF(PlannerGroup.class)).select(new ArraySink())).getArray();
    for ( Object p : pgs ) {
      PlannerGroup planner = (PlannerGroup) ((FObject)p).fclone();
      if (planner.getEnabled() == true) {
        plannerGroups_.add(planner.getId());
        planner.setEnabled(false);
      }
      if (planner.getId() == "benchmark") {
        plannerFound = true;
        planner.setEnabled(true);
      }
      try {
        ruleGroupDAO_.put(planner);
      } catch ( Exception e ) {
        logger_.error("failed to disable planner group:", p);
      }
    }
    //add benchmark planners only if they don't already exist.
    if (! plannerFound) {
      PlannerGroup p = new PlannerGroup();
      p.setId("benchmark");
      p.setEnabled(true);
      ruleGroupDAO_.put(p);
      AbstractTransactionPlanner r1 = (AbstractTransactionPlanner) ruleDAO_.find(EQ(Rule.NAME, "Digital Transaction Planner")).fclone();
      AbstractTransactionPlanner r2 = (AbstractTransactionPlanner) ruleDAO_.find(EQ(Rule.NAME, "Generic Cash In Planner")).fclone();
      r1.setId(UUID.randomUUID().toString());
      r2.setId(UUID.randomUUID().toString());
      r1.setRuleGroup("benchmark");
      r2.setRuleGroup("benchmark");
      r1.setEnabled(true);
      r2.setEnabled(true);
      ruleDAO_.put(r1);
      ruleDAO_.put(r2);
    }

    // distribute the funds to all user digital accounts
    for ( int i = 0 ; i < users_.size() ; i++ ) {
      User user = (User) users_.get(i);
      DigitalAccount account = DigitalAccount.findDefault(x, user, "CAD");
      accounts_.put(i, account);
      Transaction txn = new Transaction();
      txn.setSourceAccount(bank.getId());
      txn.setDestinationAccount(account.getId());
      txn.setAmount(STARTING_BALANCE);
      transactionDAO_.put(txn);
      Long balance = account.findBalance(x);
      assert balance >= STARTING_BALANCE;
    }

    // optionally disable all rules except for Digital Transaction Planner.
    if ( disableRules_ ) {
      int groupsDisabled = 0;
      List<RuleGroup> groups = ((ArraySink) ruleGroupDAO_.select(new ArraySink())).getArray();
      for ( RuleGroup group : groups ) {
        if ( "benchmark".equals(group.getId()) ||
             ! group.getEnabled() ) {
          continue;
        }
        group = (RuleGroup) group.fclone();
        group.setEnabled(false);
        try {
          ruleGroupDAO_.put(group);
          groupsDisabled++;
        } catch (Exception e) {
          logger_.error("failed to disable rule group:", group.getId());
        }
      }
      logger_.info("disabled rule groups:", groupsDisabled);

      int disabled = 0;
      List<Rule> rules = ((ArraySink) ruleDAO_.select(new ArraySink())).getArray();
      for ( Rule rule : rules ) {
        if ( "benchmark".equals(rule.getRuleGroup()) ||
             ! rule.getEnabled() ) {
          continue;
        }
        rule = (Rule) rule.fclone();
        rule.setEnabled(false);

        try {
          ruleDAO_.put(rule);
          disabled++;
        } catch ( Exception e ) {
          logger_.error("failed to disable rule:", rule.getName());
        }
      }
      logger_.info("disabled rules:", disabled);
    }
  }

  @Override
  public void execute(X x) {
    if ( users_.size() < 2 ) {
      logger_.warning("execute", "insufficient users", users_.size());
      return;
    }
    logger_.info("execute", "start");

    int fi = 0;
    int ti = 0;

    while ( fi == ti ) {
      fi = (int) (Math.random() * users_.size());
      ti = (int) (Math.random() * users_.size());
    }

    long amount = (long) ((Math.random() + 0.1) * 100);

    long payerId = ((User) users_.get(fi)).getId();

    long payeeId = ((User) users_.get(ti)).getId();

    // put transaction
    if ( payeeId != payerId ) {
      Transaction transaction = new Transaction();
      transaction.setPayeeId(payeeId);
      transaction.setPayerId(payerId);
      transaction.setAmount(amount);
      Account payerAccount = (DigitalAccount) accounts_.get(fi);
      Account payeeAccount = (DigitalAccount) accounts_.get(ti);
      transaction.setSourceAccount(payerAccount.getId());
      transaction.setDestinationAccount(payeeAccount.getId());
      PM pm = new PM(this.getClass().getSimpleName(), "execute");
      try {
        TransactionQuote quote = new TransactionQuote();
        quote.setRequestTransaction(transaction);
        PM quotePm = new PM(this.getClass().getSimpleName(), "quote");
        quote = (TransactionQuote) plannerDAO_.put(quote);
        transaction = quote.getPlan();
        quotePm.log(x);
        PM txnPm = new PM(this.getClass().getSimpleName(), "transaction");
        transactionDAO_.put(transaction);
        txnPm.log(x);
      } catch (RuntimeException e) {
        System.out.println(e.getMessage());
        e.printStackTrace();
        logger_.warning(e.getMessage(), e);
        pm.error(x, e);
      } finally {
        pm.log(x);
      }
    }
    logger_.info("execute", "end");
  }
}
