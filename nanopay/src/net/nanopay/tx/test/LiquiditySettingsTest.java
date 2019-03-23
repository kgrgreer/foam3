package net.nanopay.tx.test;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.CABankAccount;
import net.nanopay.model.Frequency;
import net.nanopay.tx.Liquidity;
import net.nanopay.tx.cron.LiquiditySettingsCheckCron;
import net.nanopay.tx.model.*;

import static foam.mlang.MLang.*;

import java.util.List;

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
    ls_ = setupLiquiditySettings(x, (Account) senderDigitalDefault, (Account) senderLiquidityDigital, minLimit, maxLimit, Frequency.PER_TRANSACTION);
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
  }

  public void setupAccounts() {
    sender_ = (User) ((DAO)x_.get("localUserDAO")).find(EQ(User.EMAIL,"lstesting@nanopay.net" ));
    if ( sender_ == null ) {
      sender_ = new User();
      sender_.setEmail("lstesting@nanopay.net");
    }
    sender_ = (User) sender_.fclone();
    sender_.setEmailVerified(true);
    sender_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, sender_)).fclone();
    senderDigitalDefault = DigitalAccount.findDefault(x_, sender_, "CAD");
    senderLiquidityDigital = new DigitalAccount();
    senderLiquidityDigital.setDenomination("CAD");
    senderLiquidityDigital.setOwner(sender_.getId());
    ((DAO) x_.get("localAccountDAO")).put(senderLiquidityDigital);

    receiver_ = (User) ((DAO)x_.get("localUserDAO")).find(EQ(User.EMAIL,"lstesting2@nanopay.net" ));
    if ( receiver_ == null ) {
      receiver_ = new User();
      receiver_.setEmail("lstesting2@nanopay.net");
    }
    receiver_ = (User) receiver_.fclone();
    receiver_.setEmailVerified(true);
    receiver_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, receiver_)).fclone();
    receiverDigital = DigitalAccount.findDefault(x_, receiver_, "CAD");
  }

  public void testPerTransactionLiquidity() {
    long defaultBalance = 0L;
    long liquidityBalance = 0L;

    defaultBalance = (long)senderDigitalDefault.findBalance(x_);
    // balance = 90.00
    test(senderDigitalDefault.findBalance(x_).equals(defaultBalance), "In the beginning user has CAD10000");
    Transaction txn1 = new Transaction();
    txn1.setSourceAccount(senderDigitalDefault.getId());
    txn1.setDestinationAccount(senderLiquidityDigital.getId());
    txn1.setAmount(txnTotal1);
    txn1 = (Transaction)txnDAO.put(txn1);

    liquidityBalance = liquidityBalance + defaultBalance - maxLimit;
    test(senderDigitalDefault.findBalance(x_).equals(maxLimit), "After test transaction was placed, money cashed out from digital account and balance matches maximum limit");
    test(senderLiquidityDigital.findBalance(x_).equals(liquidityBalance), "Money were cashed out to specified digital account");
    Transaction txn2 = new Transaction();
    txn2.setSourceAccount(senderDigitalDefault.getId());
    txn2.setDestinationAccount(senderLiquidityDigital.getId());
    txn2.setAmount(txnTotal2);
    txnDAO.put(txn2);
    liquidityBalance = liquidityBalance - minLimit + maxLimit;
    test(senderDigitalDefault.findBalance(x_).equals(minLimit), "After test transaction money were cashed in to digital account and the balance matches minimum limit");
    test(senderLiquidityDigital.findBalance(x_).equals(liquidityBalance  ), "Money were cashed out from specified digital account");
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
    test(balance == balance, "testAffectofCICO: initial balance: " + balance);

    Liquidity high = new Liquidity();
    high.setResetBalance(0L);
    high.setThreshold(0L);
    high.setEnableRebalancing(true);

    Liquidity low = new Liquidity();
    low.setEnableRebalancing(true);
    low.setResetBalance(0L);
    low.setThreshold(0L);

    ls_.setCashOutFrequency(Frequency.DAILY);
    ls_.setHighLiquidity(high);
    ls_.setLowLiquidity(low);
    ls_ = (LiquiditySettings) ((DAO) x.get("liquiditySettingsDAO")).put(ls_).fclone();
    LiquiditySettingsCheckCron cron = new LiquiditySettingsCheckCron(Frequency.DAILY);
    cron.execute(x_);
    balance = (Long) senderDigitalDefault.findBalance(x);
    test(SafetyUtil.equals(balance, 0L), "testAffectOfCICO: Cron Cash-Out reset balance, expecting: 0, found: "+balance);
    Transaction ci = createCompletedCashIn(x, (Account) senderBankAccount_, (Account) senderDigitalDefault, CASH_IN_AMOUNT);
    balance = (Long) senderDigitalDefault.findBalance(x);
    test(SafetyUtil.equals(balance, CASH_IN_AMOUNT), "testAffectOfCICO: Cash-In, expecting: "+CASH_IN_AMOUNT+", found: "+balance);
    Transaction co = createPendingCashOut(x, (Account) senderDigitalDefault, (Account) senderBankAccount_, CASH_OUT_AMOUNT);
    balance = (Long) senderDigitalDefault.findBalance(x);
    test(SafetyUtil.equals(balance, CASH_IN_AMOUNT - CASH_OUT_AMOUNT), "testAffectOfCICO: PENDING Cash-Out, expecting: "+(CASH_IN_AMOUNT - CASH_OUT_AMOUNT)+", found: "+balance);

    DAO d = (DAO) x.get("localTransactionDAO");
    // TODO: how to create comparator for order to order by CREATED property
    List txns = ((ArraySink) d.select_(x, new ArraySink(), 0, 1, Transaction.CREATED, null)).getArray();
    Transaction txn = (Transaction)txns.get(0);
//test(SafetyUtil.equals(txn.getAmount(), (CASH_IN_AMOUNT - CASH_OUT_AMOUNT)), "testAffectOfCICO: Txm amount, expected: "+(CASH_IN_AMOUNT - CASH_OUT_AMOUNT)+", found: "+txn.getAmount());
  }

  public Account setupBankAccount(X x, User user) {
    senderBankAccount_ = (CABankAccount) ((DAO)x_.get("localAccountDAO")).find(AND(EQ(CABankAccount.OWNER, user.getId()), INSTANCE_OF(CABankAccount.class)));
    if ( senderBankAccount_ == null ) {
      senderBankAccount_ = new CABankAccount();
      senderBankAccount_.setAccountNumber("2131412443534534");
      senderBankAccount_.setOwner(user.getId());
    } else {
      senderBankAccount_ = (CABankAccount) senderBankAccount_.fclone();
    }
    senderBankAccount_.setStatus(BankAccountStatus.VERIFIED);
    senderBankAccount_ = (CABankAccount) ((DAO)x_.get("localAccountDAO")).put_(x_, senderBankAccount_).fclone();
    return senderBankAccount_;
  }

  public LiquiditySettings setupLiquiditySettings(X x, Account account, Account bankAccount, Long minLimit, Long maxLimit, Frequency frequency) {
    LiquiditySettings ls = new LiquiditySettings();
    Liquidity highLiquidity = new Liquidity();
    highLiquidity.setEnableRebalancing(true);
    highLiquidity.setResetBalance(maxLimit);
    highLiquidity.setThreshold(maxLimit + 1);
    highLiquidity.setPushPullAccount(bankAccount.getId());
    Liquidity lowLiquidity = new Liquidity();
    lowLiquidity.setEnableRebalancing(true);
    lowLiquidity.setThreshold(minLimit - 1);
    lowLiquidity.setResetBalance(minLimit);
    lowLiquidity.setPushPullAccount(bankAccount.getId());

    ls.setId(account.getId());
    ls.setCashOutFrequency(frequency);
    ls.setHighLiquidity(highLiquidity);
    ls.setLowLiquidity(lowLiquidity);
    return (LiquiditySettings)((DAO)x.get("liquiditySettingsDAO")).put(ls).fclone();
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
}
