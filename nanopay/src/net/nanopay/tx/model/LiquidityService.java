package net.nanopay.tx.model;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import net.nanopay.account.Account;
import net.nanopay.account.Balance;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.account.Balance;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;

public class LiquidityService
  extends    ContextAwareSupport
  implements LiquidityAuth
{
  protected DAO    accountDAO_;
  protected DAO    liquiditySettingsDAO_;
  protected DAO    balanceDAO_;
  protected DAO    transactionDAO_;
  protected Logger logger_;

  protected Logger getLogger() {
    if ( logger_ == null ) logger_ = (Logger) getX().get("logger");

    return logger_;
  }

  protected DAO getAccountDAO() {
    if ( accountDAO_ == null ) accountDAO_ = (DAO) getX().get("localAccountDAO");

    return accountDAO_;
  }

  protected DAO getBalanceDAO() {
    if ( balanceDAO_ == null ) balanceDAO_ = (DAO) getX().get("localBalanceDAO");

    return balanceDAO_;
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
  public void liquifyUser(long accountId) {
    // any liquidity service will not influence the normal transaction
    try {
      liquidityCheck(accountId);
    } catch ( RuntimeException exp ) {
      getLogger().error(exp.getMessage());
    }
  }

  public FObject liquidityCheck(long accountId) {
    Account account              = (Account) getAccountDAO().find(accountId);
    LiquiditySettings liquiditySettings = getLiquiditySettings(account);

    if ( liquiditySettings == null ) {
      return null;
    }

    long balance = ( (Balance) getBalanceDAO().find(accountId) ).getBalance();
    long minBalance     = liquiditySettings.getMinimumBalance();
    long maxBalance     = liquiditySettings.getMaximumBalance();

    // arrange the balance range of user, cash in and cash out operate will only execute one or neither.
    if ( balance < minBalance ) {
      long cashInAmount = getCashInAmount(accountId, minBalance);
      if ( cashInAmount > 0 ) {
        if ( checkCashInStatus(liquiditySettings) ) {
          if ( ifCheckRangePerTransaction(liquiditySettings) ) {
            long payerBankAccountID = getBankAccountID(liquiditySettings, account);
            if ( checkBankAccountAvailable(payerBankAccountID) ) {
              return addCICOTransaction(accountId, cashInAmount, payerBankAccountID, TransactionType.CASHIN, getX());
            } else {
              getLogger().error(accountId, " Please add and verify your bank account to cash in");
            }
          }
        } else {
          getLogger().error(accountId, " not open cash in liquiditySetting");
        }
      }
    } else if ( balance > maxBalance ) {
      if ( checkCashOutStatus(liquiditySettings) ) {
        if ( ifCheckRangePerTransaction(liquiditySettings) ) {
          long payerBankAccountID = getBankAccountID(liquiditySettings, account);
          if ( checkBankAccountAvailable(payerBankAccountID) ) {
            return addCICOTransaction(accountId, balance - maxBalance, payerBankAccountID, TransactionType.CASHOUT,
                getX());
          } else {
            getLogger().error(accountId, " Please add and verify your bank account to cash in");
          }
        }
      } else {
        getLogger().error(accountId, " not open cash out liquiditySetting");
      }
    }

    getLogger().error(accountId, " No need for liquidity");
    return null;
  }

  /*
  Add cash in and cash out transaction, set transaction type to seperate if it is an cash in or cash out transaction
   */
  public FObject addCICOTransaction(long accountId, long amount, long bankAccountId, TransactionType transactionType, X x)
    throws RuntimeException
  {
    Transaction transaction = new Transaction.Builder(x)
        .setStatus(TransactionStatus.PENDING)
        .setAmount(amount)
        .setType(transactionType)
        .build();

    if ( transactionType == TransactionType.CASHIN ) {
      transaction.setDestinationAccount(accountId);
      transaction.setSourceAccount(bankAccountId);
    } else if ( transactionType == TransactionType.CASHOUT ) {
      transaction.setDestinationAccount(bankAccountId);
      transaction.setSourceAccount(accountId);
    }
    return getLocalTransactionDAO().put_(x, transaction);
  }

  public long getCashInAmount(Long accountId, Long payerMinBalance) {
    ArraySink pendingBalanceList = new ArraySink();

    getLocalTransactionDAO().where(
        AND(
            OR(
                EQ(Transaction.STATUS, TransactionStatus.PENDING),
                EQ(Transaction.STATUS, TransactionStatus.SENT)),
            EQ(Transaction.TYPE, TransactionType.CASHIN),
            EQ(Transaction.SOURCE_ACCOUNT, accountId),
            EQ(Transaction.DESTINATION_ACCOUNT, accountId)))
        .select(pendingBalanceList);

    long cashInAmount = payerMinBalance - ( (Balance) getBalanceDAO().find(accountId) ).getBalance();
    for ( Object object : pendingBalanceList.getArray() ) {
      Transaction transaction = (Transaction) getLocalTransactionDAO().find(object);
      if ( transaction.getStatus() == TransactionStatus.COMPLETED || transaction.getStatus() == TransactionStatus.DECLINED )
        continue;
      cashInAmount -= transaction.getTotal();
    }

    return cashInAmount <= 0 ? 0 : cashInAmount;
  }

  public long getBankAccountID(LiquiditySettings liquiditySettings, Account account) {
    Account bankAccount;

    if ( liquiditySettings == null ) return - 1;

    //if user ID == 0, that means this user don't set default bank account. If we want to cash in we need to find on
    // bank account which is enable for this user
    if ( liquiditySettings.getBankAccountId() == 0 ) {
      bankAccount = (Account) getAccountDAO().find(
          AND(
              EQ(BankAccount.OWNER, account.getOwner()),
              EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
          ));
    } else {
      bankAccount = (Account) getAccountDAO().find(
          AND(
              EQ(BankAccount.ID, liquiditySettings.getBankAccountId()),
              EQ(BankAccount.OWNER, liquiditySettings.getId()),
              EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
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

  public LiquiditySettings getLiquiditySettings(Account account) {
    // if user don't have liquidity settings we return the default settings of user's group
    return getLiquiditySettingsDAO().find(account.getId()) == null ? account.findOwner(x_).findGroup(x_).getLiquiditySettings() : (LiquiditySettings) getLiquiditySettingsDAO()
        .find(account.getId());
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
