package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;

import java.util.Date;

import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.tx.model.LiquiditySettings;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;


public class LiquidityTransactionDAO
    extends ProxyDAO {
  protected DAO userDAO_;
  protected DAO liquiditySettingsDAO_;
  protected DAO accountDAO_;
  protected DAO bankAccountDAO_;
  protected DAO groupDAO_;

  public LiquidityTransactionDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
    // initialize our DAO
    userDAO_ = (DAO) x.get("localUserDAO");
    bankAccountDAO_ = (DAO) x.get("localBankAccountDAO");
    accountDAO_ = (DAO) x.get("localAccountDAO");
    liquiditySettingsDAO_ = (DAO) x.get("liquiditySettingsDAO");
    groupDAO_ = (DAO) x.get("groupDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction txn = (Transaction) obj;

    // If It is a CICO Transaction, does not do anything.
    if ( txn.getPayeeId() == txn.getPayerId() ) {
      return super.put_(x, obj);
    }

    // get payer and payee account
    Account payeeAccount = (Account) accountDAO_.find(txn.getPayeeId());
    long payeeId = payeeAccount.getId();
    Account payerAccount = (Account) accountDAO_.find(txn.getPayerId());
    long payerId = payerAccount.getId();

    //get user payer anf payee
    User payer = (User) userDAO_.find(payerId);
    User payee = (User) userDAO_.find(payeeId);

    if ( payer == null || payee == null )
      throw new RuntimeException("Payer or Payee not exist");

    //get payer group and payee group
    Group payerGroup = (Group) groupDAO_.find(payer.getGroup());
    Group payeeGroup = (Group) groupDAO_.find(payee.getGroup());

    long total = txn.getTotal();
    //get payer and payee liquidity settings
    LiquiditySettings payerLiquiditySetting = payerGroup.getLiquiditySettings();
    LiquiditySettings payeeLiquiditySetting = payeeGroup.getLiquiditySettings();
    long payerMinBalance = 0;
    long payerMaxBalance = 0;
    long payeeMinBalance = 0;
    long payeeMaxBalance = 0;
    if ( payerLiquiditySetting != null ) {
      payerMinBalance = payerLiquiditySetting.getMinimumBalance();
      payerMaxBalance = payerLiquiditySetting.getMaximumBalance();
    }
    if ( payeeLiquiditySetting != null ) {
      payeeMinBalance = payeeLiquiditySetting.getMinimumBalance();
      payeeMaxBalance = payeeLiquiditySetting.getMaximumBalance();
    }

    // if the user's balance is not enough to make the payment, do cash in first
    if ( payerAccount.getBalance() < total ) {
      if ( checkCashInStatus(payerId) ) {
        long cashInAmount = total - payerAccount.getBalance();
        addCashInTransaction(payerId, cashInAmount, x);
      }else{
        throw new RuntimeException("You balance is not enough and cashIn status is not enable");
      }
    }

    // Make a payment
    FObject originalTx = null;
    originalTx = super.put_(x, obj);

    // if the user's balance big than the liquidity maxbalance, do cash out
    if ( payeeAccount.getBalance() > payeeMaxBalance ) {
      if ( checkCashOutStatus(payeeId) ) {
        long cashOutAmount = payeeAccount.getBalance() - payeeMaxBalance;
        addCashOutTransaction(payeeId, cashOutAmount, x);
      }
    }

    return originalTx;
  }

  public void addCashInTransaction(long userId, long amount, X x) throws RuntimeException{
    // get user and payee bank account
    ArraySink userBankAccount = new ArraySink();
    bankAccountDAO_.where(
        AND(
            EQ(BankAccount.OWNER, userId),
            EQ(BankAccount.STATUS, "Verified")
        ))
        .limit(1).select(userBankAccount);
    if ( userBankAccount.getArray().size() == 0 )
      throw new RuntimeException("Please add and verify your bank account to cash in from; balance is Insufficient");
    Transaction transaction = new Transaction.Builder(x)
        .setPayeeId(userId)
        .setPayerId(userId)
        .setAmount(amount)
        .setType(TransactionType.CASHIN)
        .setBankAccountId(( (BankAccount) userBankAccount.getArray().get(0) ).getId())
        .build();
    super.put_(x, transaction);
  }

  public void addCashOutTransaction(long userId, long amount, X x) throws RuntimeException{
    // get user and payee bank account
    ArraySink userBankAccount = new ArraySink();
    bankAccountDAO_.where(
        AND(
            EQ(BankAccount.OWNER, userId),
            EQ(BankAccount.STATUS, "Verified")
        ))
        .limit(1).select(userBankAccount);
    if ( userBankAccount.getArray().size() > 0 ) {
      Transaction transaction = new Transaction.Builder(x)
          .setPayeeId(userId)
          .setPayerId(userId)
          .setAmount(amount)
          .setType(TransactionType.CASHOUT)
          .setBankAccountId(( (BankAccount) userBankAccount.getArray().get(0) ).getId())
          .build();
      super.put_(x, transaction);
    }
  }

  public boolean checkCashInStatus(long userId) {
    if ( liquiditySettingsDAO_.find(userId) != null )
      return ( (LiquiditySettings) liquiditySettingsDAO_.find(userId) ).getEnableCashIn();
    return false;
  }

  public boolean checkCashOutStatus(long userId) {
    if ( liquiditySettingsDAO_.find(userId) != null )
      return ( (LiquiditySettings) liquiditySettingsDAO_.find(userId) ).getEnableCashOut();
    return false;
  }
}