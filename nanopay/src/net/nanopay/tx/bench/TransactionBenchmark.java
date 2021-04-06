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
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.sink.Count;
import foam.nanos.boot.NSpec;
import foam.nanos.auth.*;
import foam.nanos.bench.Benchmark;
import foam.nanos.auth.LifecycleState;
import foam.nanos.crunch.Capability;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import foam.nanos.session.Session;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.TrustAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
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
  protected DAO groupDAO_;
  protected DAO groupPermissionJunctionDAO_;
  protected DAO sessionDAO_;
  protected Long MAX_USERS = 100L;
  protected Long STARTING_BALANCE = 100000L;
  protected String ADMIN_BANK_ACCOUNT_NUMBER = "2131412443534534";
  protected Boolean setupOnly_ = false;
  protected String spid_ = "benchmark";


  public void setPurgePerRun(Boolean purge) {
    // nop - legacy script support
  }

  public void setDisableRules(Boolean rules) {
    // nop - legacy script support
  }

  public void setSetupOnly(Boolean value) {
    setupOnly_ = value;
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
    DAO dao = (DAO) x.get("localTransactionDAO");
    Count txns = (Count) dao.select(new Count());
    if ( txns.getValue() > 0 ) {
      stats.put("Transactions (M)", String.format("%.02", (txns.getValue() / 1000000.0)));
    } else {
      stats.put("Transactions (M)", "0");
    }

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
    PlannerGroup planner = (PlannerGroup) ruleGroupDAO_.find_(x, "genericPlanner");
    if ( planner != null ) {
      if ( planner.getEnabled() ) {
        planner = (PlannerGroup) planner.fclone();
        planner.setEnabled(false);
        try {
          ruleGroupDAO_.put(planner);
        } catch ( Exception e ) {
          logger_.error("failed to disable planner group:", planner);
        }
      }
    }
  }

  @Override
  public void setup(X x) {
    logger_ = (Logger) x.get("logger");

    System.gc();
    ruleDAO_ = (DAO) x.get("ruleDAO");
    ruleGroupDAO_ = (DAO) x.get("ruleGroupDAO");
    accountDAO_ = (DAO)x.get("localAccountDAO");
    transactionDAO_ = (DAO) x.get("localTransactionDAO");
    plannerDAO_ = (DAO) x.get("localTransactionPlannerDAO");
    userDAO_ = (DAO) x.get("localUserDAO");
    groupDAO_ = (DAO) x.get("groupDAO");
    sessionDAO_ = (DAO) x.get("localSessionDAO");

    groupPermissionJunctionDAO_ = (DAO) x.get("groupPermissionJunctionDAO");
    groupPermissionJunctionDAO_.put(new GroupPermissionJunction.Builder(x).setSourceId("api-base").setTargetId("digitalaccount.default.create").build());
    groupPermissionJunctionDAO_.put(new GroupPermissionJunction.Builder(x).setSourceId("api-base").setTargetId("service.balanceDAO").build());
    groupPermissionJunctionDAO_.put(new GroupPermissionJunction.Builder(x).setSourceId("api-base").setTargetId("balanceDAO").build());

    DAO capDAO = (DAO) x.get("localCapabilityDAO");
    Capability cap = (Capability) capDAO.find("SandBoxPlannerCapability");
    if ( cap == null ) {
      throw new RuntimeException("SandBoxPlannerCapability not found");
    }

    ServiceProvider sp = new ServiceProvider();
    sp.setId(spid_);
    sp.setDescription(spid_+" Spid");
    ((DAO) x.get("serviceProviderDAO")).put_(x, sp);

    Group group = new Group();
    group.setId(spid_+"-payment-ops");
    groupDAO_.put_(x, group);
    group = new Group();
    group.setId(spid_+"-fraud-ops");
    groupDAO_.put_(x, group);

    User admin = (User) userDAO_.find(EQ(User.EMAIL, "admin@nanopay.net"));
    if ( admin == null ) {
      throw new RuntimeException("Failed to find admin user");
    }
    admin = (User) admin.fclone();
    admin.setId(14L);
    admin.setSpid(spid_);
    admin.setFirstName(spid_);
    admin.setLastName(spid_);
    admin.setUserName(spid_);
    admin.setEmail(spid_+"@nanopay.net");
    admin = (User) userDAO_.put_(x, admin);

    CABankAccount ra = (CABankAccount) accountDAO_.find("b26ab514-e75c-4e94-9bd3-25b556bf5eef-benchmark");
    if ( ra == null ) {
      ra = new CABankAccount();
      ra.setId("b26ab514-e75c-4e94-9bd3-25b556bf5eef-benchmark");
      ra.setInstitutionNumber("943");
      ra.setBranchId("59423");
      ra.setAccountNumber("47689234");
      Address raa = new Address();
      raa.setCountryId("CA");
      raa.setPostalCode("X1X 1X1");
      raa.setRegionId("CA-ON");
      raa.setCity("Toronto");
      raa.setStreetName("1");
      raa.setStreetNumber("1");
      ra.setAddress(raa);
      ra.setOwner(admin.getId());
      ra.setSpid(spid_);
      ra.setName("Benchmark reserveAccount");
      ra.setLifecycleState(LifecycleState.ACTIVE);
      ra.setStatus(BankAccountStatus.VERIFIED);
      ra = (CABankAccount) accountDAO_.put_(x, ra);

      if (ra == null) {
        throw new RuntimeException("reserve account put has failed");
      }

    }
    TrustAccount ta = (TrustAccount) accountDAO_.find("1c0d39f4-aeea-499b-b5fb-2f0bacc512c0-benchmark");
    if ( ta == null ) {
      ta = new TrustAccount();
      ta.setId("1c0d39f4-aeea-499b-b5fb-2f0bacc512c0-benchmark");
      ta.setReserveAccount(ra.getId());
      ta.setOwner(admin.getId());
      ta.setDenomination("CAD");
      ta.setName("Benchmark trustAccount");
      ta.setSpid(spid_);
      ta = (TrustAccount) accountDAO_.put_(x, ta);

      if (ta == null) {
        throw new RuntimeException("trust account put has failed");
      }
    }

    DAO dao = accountDAO_.where(EQ(BankAccount.ACCOUNT_NUMBER,ADMIN_BANK_ACCOUNT_NUMBER)).limit(1);
    List banks = ((ArraySink) dao.select(new ArraySink())).getArray();
    BankAccount bank;
    if ( banks.size() == 1 ) {
      bank = (BankAccount) banks.get(0);
    } else {
      bank = new CABankAccount();
      bank.setName(ADMIN_BANK_ACCOUNT_NUMBER);
      bank.setDenomination("CAD");
      bank.setAccountNumber(ADMIN_BANK_ACCOUNT_NUMBER);
      bank.setOwner(admin.getId());
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank.setLifecycleState(LifecycleState.ACTIVE);
      bank = ((BankAccount) accountDAO_.put_(x, bank));
    }
    if ( bank.getStatus() != BankAccountStatus.VERIFIED ) {
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank = ((BankAccount) accountDAO_.put_(x, bank));
    }

    DAO ucj = (DAO) x.get("userCapabilityJunctionDAO");
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
        user.setEmail(s+"@BenchmarkTest.net");
        user.setEmailVerified(true);
        user.setSpid(spid_);
        // NOTE: use 'business' group so default digital account is created below.
        user.setGroup("api-base");
        user = (User) userDAO_.put(user);
        // add the ucj stuff for sandbox planners
        UserCapabilityJunction userCap = new UserCapabilityJunction();
        userCap.setTargetId("SandBoxPlannerCapability");
        userCap.setSourceId(user.getId());
        userCap.setStatus(CapabilityJunctionStatus.GRANTED);
        ucj.put(userCap);

        DigitalAccount da = new DigitalAccount();
        da.setId(String.valueOf(user.getId()));
        DigitalAccount a = (DigitalAccount) accountDAO_.find(da.getId());
        if ( a == null ) {
          da.setDenomination("CAD");
          da.setOwner(user.getId());
          da.setIsDefault(true);
          da.setTrustAccount(ta.getId());
          accountDAO_.put(da);
        } else {
          a.setTrustAccount(ta.getId());
          accountDAO_.put(a);
        }
      }
      Session session = (Session) sessionDAO_.find(user.getId());
      if ( session != null ) {
        sessionDAO_.remove(session);
      }
      session = new Session();
      session.setUserId(user.getId());
      session.setId(String.valueOf(user.getId()));
      sessionDAO_.put(session);
    }

    // If we don't use users with verfied emails, the transactions won't go
    // through for those users.
    userDAO_ = userDAO_.where(AND(EQ(User.EMAIL_VERIFIED, true), EQ(User.LAST_NAME,"Tester"), GT(User.ID, 10000)));
    users_ = ((ArraySink) userDAO_.select(new ArraySink())).getArray();

    PlannerGroup planner = (PlannerGroup) ruleGroupDAO_.find_(x, "genericPlanner");
    if ( planner != null ) {
      if ( ! planner.getEnabled() ) {
        planner = (PlannerGroup) planner.fclone();
        planner.setEnabled(true);
        try {
          ruleGroupDAO_.put(planner);
        } catch ( Exception e ) {
          logger_.error("failed to enable planner group:", planner);
        }
      }
    }

    // distribute the funds to all user digital accounts
    for ( int i = 0 ; i < users_.size() ; i++ ) {
      User user = (User) users_.get(i);
      Account account = (Account) accountDAO_.find(user.getId());
      // DigitalAccount account = DigitalAccount.findDefault(x, user, "CAD");
      accounts_.put(i, account);
      Transaction txn = new Transaction();
      txn.setSourceAccount(bank.getId());
      txn.setDestinationAccount(account.getId());
      txn.setSpid(spid_);
      txn.setAmount(STARTING_BALANCE);
      transactionDAO_.put(txn);
      Long balance = account.findBalance(x);
      assert balance >= STARTING_BALANCE;
    }
  }

  @Override
  public void execute(X x) {
    if ( setupOnly_ ) {
      return;
    }
    if ( users_.size() < 2 ) {
      logger_.warning("execute", "insufficient users", users_.size());
      return;
    }
    logger_.debug("execute", "start");

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
      transaction.setSpid(spid_);
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
      } catch (Throwable e) {
        pm.error(x, e);
        throw e;
      } finally {
        pm.log(x);
        logger_.debug("execute", "end");
      }
    }
  }
}
