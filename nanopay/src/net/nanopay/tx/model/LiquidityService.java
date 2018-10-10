package net.nanopay.tx.model;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import foam.nanos.notification.Notification;
import net.nanopay.account.Account;
import net.nanopay.account.Balance;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.TransactionQuote;
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
  protected DAO    transactionDAO_;
  protected DAO    transactionQuotePlanDAO_;
  protected Logger logger_;

  protected Logger getLogger() {
    if ( logger_ == null ) logger_ = (Logger) getX().get("logger");

    return logger_;
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

  public DAO getLocalTransactionQuotePlanDAO() {
    if ( transactionQuotePlanDAO_ == null ) transactionQuotePlanDAO_ = (DAO) getX().get("localTransactionQuotePlanDAO");

    return transactionQuotePlanDAO_;
  }

  @Override
  public void liquifyUser(long accountId) {
    Account account = (Account) getAccountDAO().find(accountId);

    if ( account == null ) {
      getLogger().info("Liquidity Service: account with id " + accountId + " not found.");
      return;
    }
    // any liquidity service will not influence the normal transaction
    try {
      liquidityCheck(account);
    } catch ( Exception exp ) {
      getLogger().error("Liquidity Service: error message " + exp.getMessage() );
    }
  }

  public void liquidityCheck(Account account) {
    getLogger().info("Liquidity service: Starting liquidityCheck for account " + account.getId());

    LiquiditySettings liquiditySettings = (LiquiditySettings) getLiquiditySettingsDAO().find(account.getId());

    getLogger().info("Personal liquidity settings: " + liquiditySettings );

    if ( liquiditySettings == null ){
      User user = (User) ((DAO) x_.get("localUserDAO")).find(account.getOwner());

      Group group = (Group) ((DAO) x_.get("groupDAO")).find(user.getGroup());
      liquiditySettings = group.getLiquiditySettings();
    }


    if ( liquiditySettings == null ) {
      getLogger().info("Liquidity Service: no liquidity settings found for account " + account.getId() );
      return;
    }

    long balance = (Long) account.findBalance(x_);
    long minBalance     = liquiditySettings.getMinimumBalance();
    long maxBalance     = liquiditySettings.getMaximumBalance();

    // arrange the balance range of user, cash in and cash out operate will only execute one or neither.
    if ( balance < minBalance ) {
      long cicoAmount = getCashInAmount(account, minBalance);
      if ( cicoAmount > 0 && liquiditySettings.getEnableCashIn() && liquiditySettings.getCashOutFrequency() == CashOutFrequency.PER_TRANSACTION ) {
        long payerBankAccountID = getBankAccountID(liquiditySettings.getBankAccountId(), account);
        if ( payerBankAccountID != -1 ) {
          addCICOTransaction(account.getId(), cicoAmount, payerBankAccountID, TransactionType.CASHIN, getX());
        }
      }
    } else if ( balance > maxBalance ) {
      if ( liquiditySettings.getEnableCashOut() &&  liquiditySettings.getCashOutFrequency() == CashOutFrequency.PER_TRANSACTION ) {
        long payerBankAccountID = getBankAccountID(liquiditySettings.getBankAccountId(), account);
        if (  payerBankAccountID != -1  ) {
          addCICOTransaction(account.getId(), balance - maxBalance, payerBankAccountID, TransactionType.CASHOUT, getX());
        }
      }
    }
    return;
  }

  /*
  Add cash in and cash out transaction, set transaction type to seperate if it is an cash in or cash out transaction
   */
  public void addCICOTransaction(long accountId, long amount, long bankAccountId, TransactionType transactionType, X x)
    throws RuntimeException
  {
    getLogger().info("Starting addCICOTransaction()" );

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
    getLogger().info("addCICOTransaction() completed" );

    TransactionQuote quote = new TransactionQuote.Builder(x)
      .setRequestTransaction(transaction)
      .build();
    quote = (TransactionQuote) getLocalTransactionQuotePlanDAO().put(quote);
    getLocalTransactionDAO().put_(x, quote.getPlan().getTransaction());
    getLogger().info("Liquidity Service: addCICOTransaction() completed" );
  }

  public long getCashInAmount(Account account, long minBalance) {
    ArraySink pendingBalanceList = new ArraySink();

    getLocalTransactionDAO().where(
        AND(
            OR(
                EQ(Transaction.STATUS, TransactionStatus.PENDING),
                EQ(Transaction.STATUS, TransactionStatus.SENT)),
            EQ(Transaction.TYPE, TransactionType.CASHIN),
            EQ(Transaction.DESTINATION_ACCOUNT, account.getId())
        ))
        .select(pendingBalanceList);

    long cashInAmount = minBalance - (Long) account.findBalance(x_);
    for ( Object object : pendingBalanceList.getArray() ) {
      Transaction transaction = (Transaction) object;
      cashInAmount -= transaction.getTotal();
    }

    return cashInAmount <= 0 ? 0 : cashInAmount;
  }

  public long getBankAccountID(long lsBankId, Account account) {
    Account bankAccount;
    //if user ID == 0, that means this user don't set default bank account. If we want to cash in we need to find on
    // bank account which is enable for this user
    if ( lsBankId == 0 ) {
      bankAccount = (Account) getAccountDAO().find(
          AND(
              EQ(BankAccount.OWNER, account.getOwner()),
              EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
          ));

    } else {
      bankAccount = (Account) getAccountDAO().find(
          AND(
              EQ(BankAccount.ID, lsBankId),
              EQ(BankAccount.OWNER, account.getOwner()),
              EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
          ));
    }

    //if bank account is null we will return -1, because our bank account id will never be negative
    if ( bankAccount == null ) {
      Notification notification = new Notification();
      notification.setNotificationType("No verified bank account for liquidity settings");
      notification.setBody("You need to add and verify bank account for liquidity settings");
      notification.setUserId(account.getOwner());
      ((DAO) x_.get("notificationDAO")).put(notification);
      return - 1;
    }

    return bankAccount.getId();
  }
}
