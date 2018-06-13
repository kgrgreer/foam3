package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.model.BankAccountStatus;
import net.nanopay.tx.model.CashOutFrequency;
import net.nanopay.tx.model.LiquiditySettings;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class LiquidityCashOutDAO extends ProxyDAO {

  protected DAO userDAO_;
  protected DAO liquiditySettingsDAO_;
  protected DAO accountDAO_;
  protected DAO bankAccountDAO_;
  protected DAO groupDAO_;
  protected Logger logger_;

  public LiquidityCashOutDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
    // initialize our DAO
    userDAO_ = (DAO) x.get("localUserDAO");
    bankAccountDAO_ = (DAO) x.get("localBankAccountDAO");
    accountDAO_ = (DAO) x.get("localAccountDAO");
    liquiditySettingsDAO_ = (DAO) x.get("liquiditySettingsDAO");
    groupDAO_ = (DAO) x.get("groupDAO");
    logger_ = (Logger) x.get("logger");
  }

  @Override
  synchronized public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction txn = (Transaction) obj;
    Transaction oldTxn = (Transaction) getDelegate().find(obj);

    if ( oldTxn != null ) return super.put_(x, obj);

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

    //get payer group and payee group
    Group payerGroup = (Group) groupDAO_.find(payer.getGroup());
    Group payeeGroup = (Group) groupDAO_.find(payee.getGroup());

    //get payer and payee group's liquidity settings
    LiquiditySettings payerLiquiditySetting = getLiquiditySettings(payer);
    LiquiditySettings payeeLiquiditySetting = getLiquiditySettings(payee);

    //get payer and payee bank account ID
    long payerBankAccountID = getBankAccountID(payerLiquiditySetting, payerId);
    long payeeBankAccountID = getBankAccountID(payeeLiquiditySetting, payeeId);

    // Make a payment
    FObject originalTx;
    try {
      originalTx = super.put_(x, obj);
    } catch ( RuntimeException exception ) {
      throw exception;
    }

    // if the user's balance bigger than the liquidity maxbalance, do cash out
    long transactionAmount = txn.getAmount();
    if ( txn.getBankAccountId() != null ) {
      transactionAmount = 0;
    }
    try {
      liquidityPayerCashOut(x, payerLiquiditySetting, payerAccount, transactionAmount, payerBankAccountID);
      liquidityPayeeCashOut(x, payeeLiquiditySetting, payeeAccount, txn.getTotal(), payeeBankAccountID);
    } catch ( RuntimeException rexp ) {
      // Do nothing if cash out is not success, cash out is not a necessary process for the payer to pay money
      logger_.error(rexp.getMessage());
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
    if ( liquiditySettings.getBankAccountId() == 0 ) {
      bankAccount = (BankAccount) bankAccountDAO_.find(
        AND(
          EQ(BankAccount.OWNER, userID),
          EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
        ));
    } else {
      bankAccount = (BankAccount) bankAccountDAO_.find(
        AND(
          EQ(BankAccount.ID, liquiditySettings.getBankAccountId()),
          EQ(BankAccount.OWNER, liquiditySettings.getId()),
          EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
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

  public void liquidityPayeeCashOut(X x, LiquiditySettings liquiditySettings, Account account, long
    transactionAmount, long bankAccountId) {
    long maxBalance = 0;
    if ( liquiditySettings != null ) {
      maxBalance = liquiditySettings.getMaximumBalance();
    }
    if ( ifCheckRangePerTransaction(liquiditySettings) ) {
      if ( account.getBalance() + transactionAmount > maxBalance ) {
        if ( checkCashOutStatus(liquiditySettings) ) {
          long cashOutAmount = account.getBalance() - maxBalance + transactionAmount;
          if ( checkBankAccountAvailable(bankAccountId) )
            addCICOTransaction(account.getId(), cashOutAmount,
              bankAccountId, TransactionType.CASHOUT, x);
        }
      }
    }
  }

  public void liquidityPayerCashOut(X x, LiquiditySettings liquiditySettings, Account account, long
    transactionAmount, long bankAccountId) throws RuntimeException {
    long maxBalance = 0;
    if ( liquiditySettings != null ) {
      maxBalance = liquiditySettings.getMaximumBalance();
    }
    if ( ifCheckRangePerTransaction(liquiditySettings) ) {

      if ( account.getBalance() - transactionAmount > maxBalance ) {
        if ( checkCashOutStatus(liquiditySettings) ) {
          addCICOTransaction(account.getId(), account.getBalance() - transactionAmount - maxBalance, bankAccountId,
            TransactionType.CASHOUT, x);
        }
      }
    }
  }
}
