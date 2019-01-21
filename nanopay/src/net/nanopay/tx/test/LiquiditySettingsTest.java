package net.nanopay.tx.test;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import foam.util.SafetyUtil;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.cron.LiquiditySettingsCheckCron;
import net.nanopay.tx.model.Frequency;
import net.nanopay.tx.model.LiquiditySettings;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.FeeTransfer;
import net.nanopay.tx.Transfer;

import static foam.mlang.MLang.*;

public class LiquiditySettingsTest
  extends foam.nanos.test.Test
{
  User sender_, receiver_;
  X x_;
  CABankAccount senderBankAccount_;
  DAO txnDAO;
  DigitalAccount senderDigitalDefault, senderLiquidityDigital, receiverDigital;
  long minLimit = 470, maxLimit = 1210, txnTotal1 = 10, txnTotal2 = 1000;
  LiquiditySettings ls;
  public void runTest(X x) {
    txnDAO = (DAO) x.get("localTransactionDAO");
    x_ = x;
    addDigitalAccounts();
    setBankAccount();
    cashIn();
    testPerTransactionLiquidity();
    testLsCronjob();
  }

  public void addDigitalAccounts() {
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
    long defaultBalance;
    long liquidityBalance;

    defaultBalance = (long)senderDigitalDefault.findBalance(x_);
    liquidityBalance = (long)senderLiquidityDigital.findBalance(x_);

    ls = new LiquiditySettings();
    ls.setId(senderDigitalDefault.getId());
    ls.setEnableCashIn(true);
    ls.setEnableCashOut(true);
    ls.setMaximumBalance(maxLimit);
    ls.setMinimumBalance(minLimit);
    ls.setCashOutFrequency(Frequency.PER_TRANSACTION);
    ls.setBankAccountId(senderLiquidityDigital.getId());
    ((DAO)x_.get("liquiditySettingsDAO")).put(ls);

    test(senderDigitalDefault.findBalance(x_).equals(defaultBalance), "In the beginning user has CAD10000");
    Transaction txn1 = new Transaction();
    txn1.setSourceAccount(senderDigitalDefault.getId());
    txn1.setDestinationAccount(senderLiquidityDigital.getId());
    txn1.setAmount(txnTotal1);
    txnDAO.put(txn1);

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
    ls.setCashOutFrequency(Frequency.DAILY);
    ((DAO)x_.get("liquiditySettingsDAO")).put(ls);
    Transaction txn1 = new Transaction();
    txn1.setSourceAccount(senderLiquidityDigital.getId());
    txn1.setDestinationAccount(senderDigitalDefault.getId());
    txn1.setAmount(maxLimit + 1);
    txnDAO.put(txn1);
    test(SafetyUtil.equals(senderDigitalDefault.findBalance(x_), originalBalanceDef +  maxLimit + 1), "before cron job account has $0");
    LiquiditySettingsCheckCron cron = new LiquiditySettingsCheckCron(Frequency.DAILY);
    cron.execute(x_);
    test(SafetyUtil.equals(senderLiquidityDigital.findBalance(x_), (originalLiquidityDef + originalBalanceDef) - maxLimit), "after the cron job liquidity account has correct amount");
    test(SafetyUtil.equals(senderDigitalDefault.findBalance(x_), maxLimit), "after the cron job account digital account has max amount");

  }

  public void setBankAccount() {
    senderBankAccount_ = (CABankAccount) ((DAO)x_.get("localAccountDAO")).find(AND(EQ(CABankAccount.OWNER, sender_.getId()), INSTANCE_OF(CABankAccount.class)));
    if ( senderBankAccount_ == null ) {
      senderBankAccount_ = new CABankAccount();
      senderBankAccount_.setAccountNumber("2131412443534534");
      senderBankAccount_.setOwner(sender_.getId());
    } else {
      senderBankAccount_ = (CABankAccount)senderBankAccount_.fclone();
    }
    senderBankAccount_.setStatus(BankAccountStatus.VERIFIED);
    senderBankAccount_ = (CABankAccount) ((DAO)x_.get("localAccountDAO")).put_(x_, senderBankAccount_).fclone();
  }

  public void cashIn() {
    Transaction txn = new Transaction();
    txn.setAmount(10000);
    txn.setSourceAccount(senderBankAccount_.getId());
    txn.setDestinationAccount(senderDigitalDefault.getId());
    txn = (Transaction) (((DAO) x_.get("localTransactionDAO")).put_(x_, txn)).fclone();
    txn.setStatus(TransactionStatus.COMPLETED);
    ((DAO) x_.get("localTransactionDAO")).put_(x_, txn);
  }

}
