package net.nanopay.liquidity;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.util.Frequency;
import net.nanopay.liquidity.LiquiditySettings;

import java.util.List;

import static foam.mlang.MLang.*;

public class LiquiditySettingsTest
  extends foam.nanos.test.Test
{
  User sender_, receiver_;
  X x_;
  BankAccount senderBankAccount_;
  DAO txnDAO;
  DigitalAccount senderDigitalDefault, senderLiquidityDigital, receiverDigital;
  long minLimit = 470, maxLimit = 1210, txnTotal1 = 10, txnTotal2 = 1000, CASH_OUT_AMOUNT = 1000L, CASH_IN_AMOUNT = 10000L;
  LiquiditySettings ls_;

  public void runTest(X x) {
    txnDAO = (DAO) x.get("localTransactionDAO");
    x_ = x;
    setupAccounts();
    long initialBalance = (Long)senderDigitalDefault.findBalance(x);
    senderBankAccount_ = (BankAccount) setupBankAccount(x, sender_);
    ls_ = setupLiquiditySettings(x, senderDigitalDefault, senderLiquidityDigital, minLimit, maxLimit, Frequency.PER_TRANSACTION);
    Transaction ci = createCompletedCashIn(x, (Account) senderBankAccount_, (Account) senderDigitalDefault, CASH_IN_AMOUNT);
    // Cash-In to self will not trigger Liquidity
    Long balance = (Long)senderDigitalDefault.findBalance(x);
    test(balance == CASH_IN_AMOUNT + initialBalance, "Initial balance "+CASH_IN_AMOUNT);
    // Cash-Out to self will not trigger Liquidity
    Transaction co = createPendingCashOut(x, (Account) senderDigitalDefault, (Account) senderBankAccount_, CASH_OUT_AMOUNT);
    balance = (Long)senderDigitalDefault.findBalance(x);
    test(balance == CASH_IN_AMOUNT + initialBalance - CASH_OUT_AMOUNT, "Balance with PENDING Cash-Out "+(initialBalance + CASH_IN_AMOUNT-CASH_OUT_AMOUNT));

    testPerTransactionLiquidity();
    testLsCronjob();

    testAffectOfCICO(x);
    testLsValidity();
  }

  public void setupAccounts() {
    sender_ = new User();
    sender_.setEmail("lstesting1@nanopay.net");
    sender_ = (User) sender_.fclone();
    sender_.setEmailVerified(true);
    sender_.setFirstName("Francis");
    sender_.setLastName("Filth");
    sender_.setGroup("business");
    sender_.setSpid("test");
    sender_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, sender_)).fclone();
    senderDigitalDefault = (DigitalAccount) DigitalAccount.findDefault(x_, sender_, "CAD","7ee216ae-9371-4684-9e99-ba42a5759444").fclone();
    senderLiquidityDigital = new DigitalAccount();
    senderLiquidityDigital.setDenomination("CAD");
    senderLiquidityDigital.setOwner(sender_.getId());
    senderLiquidityDigital.setTrustAccount("7ee216ae-9371-4684-9e99-ba42a5759444");
    ((DAO) x_.get("localAccountDAO")).put(senderLiquidityDigital);

      receiver_ = new User();
      receiver_.setFirstName("Francis");
      receiver_.setLastName("Filth");
      receiver_.setEmail("lstesting2@nanopay.net");
      receiver_.setGroup("business");
    receiver_.setEmailVerified(true);
    receiver_.setSpid("test");
    receiver_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, receiver_)).fclone();
    receiverDigital = DigitalAccount.findDefault(x_, receiver_, "CAD","7ee216ae-9371-4684-9e99-ba42a5759444");
  }

  public void testPerTransactionLiquidity() {
    long defaultBalance = 0L;
    long liquidityBalance = 0L;

    defaultBalance = (long)senderDigitalDefault.findBalance(x_);
    // balance = 90.00
    test(senderDigitalDefault.findBalance(x_) == (defaultBalance), "In the beginning user has CAD "+defaultBalance);
    Transaction txn1 = new Transaction();
    txn1.setSourceAccount(senderDigitalDefault.getId());
    txn1.setDestinationAccount(senderLiquidityDigital.getId());
    txn1.setAmount(txnTotal1);
    txn1 = (Transaction)txnDAO.put(txn1);

    liquidityBalance = liquidityBalance + defaultBalance - maxLimit;
    test(senderDigitalDefault.findBalance(x_) == (maxLimit), "After test transaction was placed, money cashed out from digital account and balance (" +senderDigitalDefault.findBalance(x_) + ") matches maximum limit, "+ maxLimit );
    test(senderLiquidityDigital.findBalance(x_) == (liquidityBalance), "Money were cashed out to specified digital account");
    Transaction txn2 = new Transaction();
    txn2.setSourceAccount(senderDigitalDefault.getId());
    txn2.setDestinationAccount(senderLiquidityDigital.getId());
    txn2.setAmount(txnTotal2);
    txnDAO.put(txn2);
    liquidityBalance = liquidityBalance - minLimit + maxLimit;
    test(senderDigitalDefault.findBalance(x_) == (minLimit), "After test transaction money were cashed in to digital account and the balance matches minimum limit");
    test(senderLiquidityDigital.findBalance(x_) == (liquidityBalance  ), "Money were cashed out from specified digital account");
  }

  public void testLsCronjob() {
    long originalBalanceDef = (long)senderDigitalDefault.findBalance(x_);
    long originalLiquidityDef = (long)senderLiquidityDigital.findBalance(x_);
    ls_.setCashOutFrequency(Frequency.DAILY);
    ls_ = (LiquiditySettings) ((DAO)x_.get("liquiditySettingsDAO")).put(ls_).fclone();
    Transaction txn1 = new Transaction();
    txn1.setSourceAccount(senderLiquidityDigital.getId());
    txn1.setDestinationAccount(senderDigitalDefault.getId());
    txn1.setAmount(maxLimit + 2);
    txn1 = (Transaction) txnDAO.put(txn1);
    Long expected = originalBalanceDef + maxLimit + 2;
    test(SafetyUtil.equals(senderDigitalDefault.findBalance(x_),expected), "before cron job account has "+expected);
    LiquiditySettingsCheckCron cron = new LiquiditySettingsCheckCron(Frequency.DAILY);
    cron.execute(x_);
    expected = originalLiquidityDef + originalBalanceDef - maxLimit;
    Long balance = (Long) senderLiquidityDigital.findBalance(x_);
    test(SafetyUtil.equals(balance, expected), "after the cron job liquidity account has correct amount. expected: "+expected+", found: "+balance);
    balance = (Long) senderDigitalDefault.findBalance(x_);
    test(SafetyUtil.equals(balance, maxLimit), "after the cron job account digital account has max amount. expected: "+maxLimit+", found: "+balance);
  }

  public void testAffectOfCICO(X x) {
    Long balance = (Long) senderLiquidityDigital.findBalance(x);

    Liquidity high = new Liquidity();
    high.setResetBalance(3L);
    high.setThreshold(4L);
    high.setRebalancingEnabled(true);

    Liquidity low = new Liquidity();
    low.setRebalancingEnabled(true);
    low.setResetBalance(2L);
    low.setThreshold(1L);

    ls_.setCashOutFrequency(Frequency.DAILY);
    ls_.setHighLiquidity(high);
    ls_.setLowLiquidity(low);
    ls_ = (LiquiditySettings) ((DAO) x.get("liquiditySettingsDAO")).put(ls_).fclone();
    LiquiditySettingsCheckCron cron = new LiquiditySettingsCheckCron(Frequency.DAILY);
    cron.execute(x_);
    balance = (Long) senderDigitalDefault.findBalance(x);
    test(SafetyUtil.equals(balance, 3L), "testAffectOfCICO: Cron Cash-Out reset balance, expecting: "+high.getResetBalance()+", found: "+balance);
    Transaction ci = createCompletedCashIn(x, (Account) senderBankAccount_, (Account) senderDigitalDefault, CASH_IN_AMOUNT);
    balance = (Long) senderDigitalDefault.findBalance(x);
    test(SafetyUtil.equals(balance, CASH_IN_AMOUNT+high.getResetBalance()), "testAffectOfCICO: Cash-In, expecting: "+CASH_IN_AMOUNT+high.getResetBalance()+", found: "+balance);
    Transaction co = createPendingCashOut(x, (Account) senderDigitalDefault, (Account) senderBankAccount_, CASH_OUT_AMOUNT);
    //DAO approvalDAO = (DAO) x_.get("approvalRequestDAO");
    //ApprovalRequest request = (ApprovalRequest) approvalDAO.find(AND(EQ(ApprovalRequest.OBJ_ID, co.getId()), EQ(ApprovalRequest.SERVER_DAO_KEY, "localTransactionDAO"))).fclone();
    //request.setStatus(ApprovalStatus.APPROVED);
    //approvalDAO.put_(x_, request);

    balance = (Long) senderDigitalDefault.findBalance(x);
    test(SafetyUtil.equals(balance, CASH_IN_AMOUNT - CASH_OUT_AMOUNT+high.getResetBalance()), "testAffectOfCICO: PENDING Cash-Out, expecting: "+(CASH_IN_AMOUNT - CASH_OUT_AMOUNT)+high.getResetBalance()+", found: "+balance);

    DAO d = (DAO) x.get("localTransactionDAO");
    // TODO: how to create comparator for order to order by CREATED property
    List txns = ((ArraySink) d.select_(x, new ArraySink(), 0, 1, Transaction.CREATED, null)).getArray();
    Transaction txn = (Transaction)txns.get(0);
//test(SafetyUtil.equals(txn.getAmount(), (CASH_IN_AMOUNT - CASH_OUT_AMOUNT)), "testAffectOfCICO: Txm amount, expected: "+(CASH_IN_AMOUNT - CASH_OUT_AMOUNT)+", found: "+txn.getAmount());
  }

  public Account setupBankAccount(X x, User user) {
      senderBankAccount_ = new CABankAccount();
      senderBankAccount_.setAccountNumber("2131412443534534");
      senderBankAccount_.setOwner(user.getId());
    senderBankAccount_.setStatus(BankAccountStatus.VERIFIED);
    senderBankAccount_ = (CABankAccount) ((DAO)x_.get("localAccountDAO")).put_(x_, senderBankAccount_).fclone();
    return senderBankAccount_;
  }

  public LiquiditySettings setupLiquiditySettings(X x, DigitalAccount account, Account bankAccount, Long minLimit, Long maxLimit, Frequency frequency) {
    LiquiditySettings ls = new LiquiditySettings();
    Liquidity highLiquidity = new Liquidity();
    highLiquidity.setRebalancingEnabled(true);
    highLiquidity.setResetBalance(maxLimit);
    highLiquidity.setThreshold(maxLimit + 1);
    highLiquidity.setPushPullAccount(bankAccount.getId());
    Liquidity lowLiquidity = new Liquidity();
    lowLiquidity.setRebalancingEnabled(true);
    lowLiquidity.setThreshold(minLimit - 1);
    lowLiquidity.setResetBalance(minLimit);
    lowLiquidity.setPushPullAccount(bankAccount.getId());

    ls.setCashOutFrequency(frequency);
    ls.setHighLiquidity(highLiquidity);
    ls.setLowLiquidity(lowLiquidity);
    LiquiditySettings ls1 = (LiquiditySettings)((DAO)x.get("liquiditySettingsDAO")).put(ls).fclone();
    account.setLiquiditySetting(ls1.getId());
    ((DAO) x_.get("localAccountDAO")).put(account);
    return ls1;
  }

  public Transaction createCompletedCashIn(X x, Account source, Account destination, Long amount) {
    Transaction txn = new Transaction();
    txn.setAmount(CASH_IN_AMOUNT);
    txn.setSourceAccount(source.getId());
    txn.setDestinationAccount(destination.getId());
    txn = (Transaction) (((DAO) x.get("localTransactionDAO")).put_(x, txn)).fclone();
    txn.setStatus(TransactionStatus.COMPLETED);
    return (Transaction)((DAO) x.get("localTransactionDAO")).put_(x, txn);
  }

  public Transaction createPendingCashOut(X x, Account source, Account destination, Long amount) {
    Transaction txn = new Transaction();
    txn.setAmount(amount);
    txn.setSourceAccount(source.getId());
    txn.setDestinationAccount(destination.getId());
    return (Transaction) (((DAO) x.get("localTransactionDAO")).put_(x, txn));
  }

  public void testLsValidity() {
    DAO lsDAO = (DAO) x_.get("liquiditySettingsDAO");
    LiquiditySettings ls = new LiquiditySettings();
    Liquidity high = new Liquidity();
    Liquidity low = new Liquidity();
    low.setRebalancingEnabled(true);
    high.setRebalancingEnabled(true);
    high.setEnabled(false);

    low.setThreshold(5);
    low.setResetBalance(3);

    ls.setHighLiquidity(high);
    ls.setLowLiquidity(low);

    test(TestUtils.testThrows(
      () -> lsDAO.put_(x_, high),
      "you can only put instanceof LiquiditySettings to LiquiditySettingsDAO",
      RuntimeException.class), "Exception: you can only put instanceof LiquiditySettings to LiquiditySettingsDAO");

    test(TestUtils.testThrows(
      () -> lsDAO.put_(x_, ls),
      "The low liquidity reset balance must be more then the threshold balance",
      RuntimeException.class), "Exception: The low liquidity reset balance must be more then the threshold balance");

    high.setResetBalance(4);
    high.setThreshold(3);
    high.setEnabled(true);
    ls.setHighLiquidity(high);

    test(TestUtils.testThrows(
      () -> lsDAO.put_(x_, ls),
      "The high liquidity reset balance must be less then the threshold balance",
      RuntimeException.class), "Exception: The high liquidity reset balance must be less then the threshold balance");

    low.setThreshold(10);
    low.setResetBalance(11);
    high.setThreshold(2);
    high.setResetBalance(1);
    ls.setHighLiquidity(high);
    ls.setLowLiquidity(low);

    test(TestUtils.testThrows(
      () -> lsDAO.put_(x_, ls),
      "The high liquidity threshold must be above the low liquidity threshold",
      RuntimeException.class), "Exception: The high liquidity threshold must be above the low liquidity threshold");

    high.setThreshold(10);
    high.setResetBalance(2);
    low.setThreshold(3);
    low.setResetBalance(5);
    ls.setHighLiquidity(high);
    ls.setLowLiquidity(low);

    test(TestUtils.testThrows(
      () -> lsDAO.put_(x_, ls),
      "The low liquidity threshold must be below the high liquidity reset balance",
      RuntimeException.class), "Exception: The low liquidity threshold must be below the high liquidity reset balance");

    low.setThreshold(1);
    low.setResetBalance(11);
    ls.setLowLiquidity(low);

    test(TestUtils.testThrows(
      () -> lsDAO.put_(x_, ls),
      "The high liquidity threshold must be above the low liquidity reset balance",
      RuntimeException.class), "Exception: The high liquidity threshold must be above the low liquidity reset balance");
  }
}
