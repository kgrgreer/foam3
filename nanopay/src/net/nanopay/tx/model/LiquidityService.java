package net.nanopay.tx.model;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;

public class LiquidityService
  extends    ContextAwareSupport
  implements LiquidityAuth
{
  protected DAO    userDAO_;
  protected DAO    liquiditySettingsDAO_;
  protected DAO    accountDAO_;
  protected DAO    bankAccountDAO_;
  protected DAO    transactionDAO_;
  protected Logger logger_;

  protected Logger getLogger() {
    if ( logger_ == null ) logger_ = (Logger) getX().get("logger");

    return logger_;
  }

  protected DAO getUserDAO() {
    if ( userDAO_ == null ) userDAO_ = (DAO) getX().get("localUserDAO");

    return userDAO_;
  }

  protected DAO getBankAccountDAO() {
    if ( bankAccountDAO_ == null ) bankAccountDAO_ = (DAO) getX().get("localBankAccountDAO");

    return bankAccountDAO_;
  }

  protected DAO getAccountDAO() {
    if ( accountDAO_ == null ) accountDAO_ = (DAO) getX().get("localAccountDAO");

    return accountDAO_;
  }

  protected DAO getLiquiditySettingsDAO() {
    if ( liquiditySettingsDAO_ == null ) liquiditySettingsDAO_ = (DAO) getX().get("liquiditySettingsDAO");

    return liquiditySettingsDAO_;
  }


  public DAO getLocalTransactionDAO() {
    if ( transactionDAO_ == null ) transactionDAO_ = (DAO) getX().get("localTransactionDAO");

    return transactionDAO_;
  }

  @Override
  public void liquifyUser(long userId) {
    // any liquidity service will not influence the normal transaction
    try {
      liquidityCheck(userId);
    } catch ( RuntimeException exp ) {
      getLogger().error(exp.getMessage());
    }
  }

  public FObject liquidityCheck(long userId) {
    User              user              = (User) getUserDAO().find(userId);
    LiquiditySettings liquiditySettings = getLiquiditySettings(user);

    if ( liquiditySettings == null ) {
      return null;
    }

    long currentBalance = ( (Account) getAccountDAO().find(userId) ).getBalance();
    long minBalance     = liquiditySettings.getMinimumBalance();
    long maxBalance     = liquiditySettings.getMaximumBalance();

    // arrange the balance range of user, cash in and cash out operate will only execute one or neither.
    if ( currentBalance < minBalance ) {
      long cashInAmount = getCashInAmount(userId, minBalance);
      if ( cashInAmount > 0 ) {
        if ( checkCashInStatus(liquiditySettings) ) {
          if ( ifCheckRangePerTransaction(liquiditySettings) ) {
            long payerBankAccountID = getBankAccountID(liquiditySettings, userId);
            if ( checkBankAccountAvailable(payerBankAccountID) ) {
              return addCICOTransaction(userId, cashInAmount, payerBankAccountID, TransactionType.CASHIN, getX());
            } else {
              getLogger().error(userId, " Please add and verify your bank account to cash in");
            }
          }
        } else {
          getLogger().error(userId, " not open cash in liquiditySetting");
        }
      }
    } else if ( currentBalance > maxBalance ) {
      if ( checkCashOutStatus(liquiditySettings) ) {
        if ( ifCheckRangePerTransaction(liquiditySettings) ) {
          long payerBankAccountID = getBankAccountID(liquiditySettings, userId);
          if ( checkBankAccountAvailable(payerBankAccountID) ) {
            return addCICOTransaction(userId, currentBalance - maxBalance, payerBankAccountID, TransactionType.CASHOUT,
                getX());
          } else {
            getLogger().error(userId, " Please add and verify your bank account to cash in");
          }
        }
      } else {
        getLogger().error(userId, " not open cash out liquiditySetting");
      }
    }

    getLogger().error(userId, " No need for liquidity");
    return null;
  }

  /*
  Add cash in and cash out transaction, set transaction type to seperate if it is an cash in or cash out transaction
   */
  public FObject addCICOTransaction(long userId, long amount, long bankAccountId, TransactionType transactionType, X x)
    throws RuntimeException
  {
    Transaction transaction = new Transaction.Builder(x)
        .setStatus(TransactionStatus.PENDING)
        .setPayeeId(userId)
        .setPayerId(userId)
        .setAmount(amount)
        .setType(transactionType)
        .setBankAccountId(bankAccountId)
        .build();
    return getLocalTransactionDAO().put_(x, transaction);
  }

  public long getCashInAmount(Long payerId, Long payerMinBalance) {
    ArraySink pendingBalanceList = new ArraySink();

    getLocalTransactionDAO().where(
        AND(
            OR(
                EQ(Transaction.STATUS, TransactionStatus.PENDING),
                EQ(Transaction.STATUS, TransactionStatus.SENT)),
            EQ(Transaction.TYPE, TransactionType.CASHIN),
            EQ(Transaction.PAYER_ID, payerId),
            EQ(Transaction.PAYEE_ID, payerId)))
        .select(pendingBalanceList);

    long cashInAmount = payerMinBalance - ( (Account) getAccountDAO().find(payerId) ).getBalance();
    for ( Object object : pendingBalanceList.getArray() ) {
      Transaction transaction = (Transaction) getLocalTransactionDAO().find(object);
      if ( transaction.getStatus() == TransactionStatus.COMPLETED || transaction.getStatus() == TransactionStatus.DECLINED )
        continue;
      cashInAmount -= transaction.getTotal();
    }

    return cashInAmount <= 0 ? 0 : cashInAmount;
  }

  public long getBankAccountID(LiquiditySettings liquiditySettings, long userID) {
    BankAccount bankAccount;

    if ( liquiditySettings == null ) return - 1;

    //if user ID == 0, that means this user don't set default bank account. If we want to cash in we need to find on
    // bank account which is enable for this user
    if ( liquiditySettings.getBankAccountId() == 0 ) {
      bankAccount = (BankAccount) getBankAccountDAO().find(
          AND(
              EQ(BankAccount.OWNER, userID),
              EQ(BankAccount.STATUS, "Verified")
          ));
    } else {
      bankAccount = (BankAccount) getBankAccountDAO().find(
          AND(
              EQ(BankAccount.ID, liquiditySettings.getBankAccountId()),
              EQ(BankAccount.OWNER, liquiditySettings.getId()),
              EQ(BankAccount.STATUS, "Verified")
          ));
    }

    //if bank account is null we will return -1, because our bank account id will never be negative
    if ( bankAccount == null ) return - 1;

    return bankAccount.getId();
  }

  public boolean checkBankAccountAvailable(long bankAccountID) {
    // if bank account is -1, that means this bank account is not available
    return bankAccountID != - 1;
  }

  public LiquiditySettings getLiquiditySettings(User user) {
    // if user don't have liquidity settings we return the default settings of user's group
    return getLiquiditySettingsDAO().find(user.getId()) == null ? null : (LiquiditySettings) getLiquiditySettingsDAO()
        .find(user.getId());
  }

  public boolean checkCashInStatus(LiquiditySettings liquiditySettings) {
    return liquiditySettings != null && liquiditySettings.getEnableCashIn();
  }

  public boolean checkCashOutStatus(LiquiditySettings liquiditySettings) {
    return liquiditySettings != null && liquiditySettings.getEnableCashOut();
  }

  public boolean ifCheckRangePerTransaction(LiquiditySettings liquiditySettings) {
    return liquiditySettings != null && liquiditySettings.getCashOutFrequency() == CashOutFrequency.PER_TRANSACTION;
  }
}
