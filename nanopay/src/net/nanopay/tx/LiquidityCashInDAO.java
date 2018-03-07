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
import net.nanopay.liquidity.model.Liquidity;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.tx.model.CashOutFrequency;
import net.nanopay.tx.model.LiquiditySettings;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;


public class LiquidityCashInDAO
    extends ProxyDAO {
  protected DAO userDAO_;
  protected DAO liquiditySettingsDAO_;
  protected DAO accountDAO_;
  protected DAO bankAccountDAO_;
  protected DAO groupDAO_;

  public LiquidityCashInDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
    // initialize our DAO
    userDAO_              = (DAO) x.get("localUserDAO");
    bankAccountDAO_       = (DAO) x.get("localBankAccountDAO");
    accountDAO_           = (DAO) x.get("localAccountDAO");
    liquiditySettingsDAO_ = (DAO) x.get("liquiditySettingsDAO");
    groupDAO_             = (DAO) x.get("groupDAO");
  }

  @Override
  synchronized public FObject put_(X x, FObject obj) throws RuntimeException{
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

    //get user payer and payee
    User payer = (User) userDAO_.find(payerId);
    User payee = (User) userDAO_.find(payeeId);

    // check if user exist
    if ( payer == null ) throw new RuntimeException("Payer not exist");
    if ( payee == null ) throw new RuntimeException("Payee not exist");

    //get payer group and payee group
    Group payerGroup = (Group) groupDAO_.find(payer.getGroup());
    Group payeeGroup = (Group) groupDAO_.find(payee.getGroup());

    long total = txn.getTotal();

    //get payer and payee group's liquidity settings
    LiquiditySettings payerLiquiditySetting = getLiquiditySettings(payer);
    LiquiditySettings payeeLiquiditySetting = getLiquiditySettings(payee);

    //get payer and payee bank account ID
    long payerBankAccountID = getBankAccountID(payerLiquiditySetting, payerId);
    long payerMinBalance = 0;
    if ( payerLiquiditySetting != null ) {
      payerMinBalance = payerLiquiditySetting.getMinimumBalance();
    }

    BankAccount bankAccount = (BankAccount) bankAccountDAO_.find(txn.getBankAccountId());

    // if the user's balance is not enough to make the payment, do cash in first
    if ( payerAccount.getBalance() - payerMinBalance < total ) {
      if ( checkCashInStatus(payerLiquiditySetting) ) {
        long cashInAmount = total - payerAccount.getBalance();
        if ( ifCheckRangePerTransaction(payerLiquiditySetting) ) {
          cashInAmount += payerMinBalance;
        }
        if ( checkBankAccountAvailable(payerBankAccountID) ) {
          addCICOTransaction(payerId, cashInAmount, payerBankAccountID, TransactionType.CASHIN, x);
        } else {
          throw new RuntimeException("Please add and verify your bank account to cash in");
        }
      } else {
        throw new RuntimeException("balance is insufficient");
      }
    }

    // Make a payment
    FObject originalTx;
    try{
      originalTx = super.put_(x, obj);
    }catch ( RuntimeException exception ){
      throw exception;
    }
    return originalTx;
  }

  /*
  Add cash in and cash out transaction, set transaction type to seperate if it is an cash in or cash out transaction
   */
  public void addCICOTransaction(long userId, long amount, long bankAccountId, TransactionType transactionType, X
      x) throws
      RuntimeException {
    Transaction transaction = new Transaction.Builder(x)
        .setPayeeId(userId)
        .setPayerId(userId)
        .setAmount(amount)
        .setType(transactionType)
        .setBankAccountId(bankAccountId)
        .build();
    DAO txnDAO = (DAO) x.get("transactionDAO");
    txnDAO.put_(x, transaction);
  }

  public long getBankAccountID(LiquiditySettings liquiditySettings, long userID) {
    BankAccount bankAccount;
    if ( liquiditySettings == null )
      return - 1;
    //if user ID == 0, that means this user don't set default bank account. If we want to cash in we need to find on
    // bank account which is enable for this user
    if ( liquiditySettings.getId() == 0 ) {
      bankAccount = (BankAccount) bankAccountDAO_.find(
          AND(
              EQ(BankAccount.OWNER, userID),
              EQ(BankAccount.STATUS, "Verified")
          ));
    } else {
      bankAccount = (BankAccount) bankAccountDAO_.find(
          AND(
              EQ(BankAccount.ID, liquiditySettings.getBankAccountId()),
              EQ(BankAccount.OWNER, liquiditySettings.getId()),
              EQ(BankAccount.STATUS, "Verified")
          ));
    }
    //if bank account is null we will return -1, because our bank account id will never be negative
    if ( bankAccount == null )
      return - 1;

    return bankAccount.getId();
  }

  public boolean checkBankAccountAvailable(long bankAccountID) {
    // if bank account is -1, that means this bank account is not available
    if ( bankAccountID == - 1 )
      return false;
    return true;
  }

  public LiquiditySettings getLiquiditySettings(User user) {
    // if user don't have liquidity settings we return the default settings of user's group
    return liquiditySettingsDAO_.find(user.getId()) == null ? ( (Group) groupDAO_.find(user.getGroup()) )
        .getLiquiditySettings() : (LiquiditySettings) liquiditySettingsDAO_.find(user.getId());
  }

  public boolean checkCashInStatus(LiquiditySettings liquiditySettings) {
    if ( liquiditySettings != null )
      return liquiditySettings.getEnableCashIn();
    return false;
  }

  public boolean checkCashOutStatus(LiquiditySettings liquiditySettings) {
    if ( liquiditySettings != null )
      return liquiditySettings.getEnableCashOut();
    return false;
  }

  public boolean ifCheckRangePerTransaction(LiquiditySettings liquiditySettings) {
    if ( liquiditySettings != null ) {
      if ( liquiditySettings.getCashOutFrequency() == CashOutFrequency.PER_TRANSACTION )
        return true;
    }
    return false;
  }
}
