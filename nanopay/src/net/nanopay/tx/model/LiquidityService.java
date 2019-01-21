package net.nanopay.tx.model;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import java.util.List;

import static foam.mlang.MLang.*;

public class LiquidityService
  extends    ContextAwareSupport
  implements LiquidityAuth
{
  protected DAO    accountDAO_;
  protected DAO    liquiditySettingsDAO_;
  protected DAO    transactionDAO_;
  protected Logger logger_;


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
  public void liquifyAccount(long accountId, Frequency frequency) {
    LiquiditySettings ls =null;
    ls = (LiquiditySettings) getLiquiditySettingsDAO().find(accountId);
    if ( ls == null || ls.getCashOutFrequency() != frequency ) return;
    executeLiquidity(ls);
  }

  @Override
  public void liquifyFrequency(Frequency frequency ) {
    getLiquiditySettingsDAO().where(EQ(LiquiditySettings.CASH_OUT_FREQUENCY, frequency)).select( new AbstractSink() {
      @Override
      public void put(Object o, Detachable d) {
        LiquiditySettings ls = (LiquiditySettings) o;
        executeLiquidity(ls);
      }
    });

  }

  public void executeLiquidity(LiquiditySettings ls) {
    DigitalAccount account = ls.findAccount(getX());
    if ( account == null ) return;
    Account liquidityAccount = ls.findBankAccountId(x_);
    long payerBankAccountID;
    if ( liquidityAccount != null && liquidityAccount instanceof DigitalAccount ) {
      payerBankAccountID = liquidityAccount.getId();
    } else {
      payerBankAccountID = getBankAccountID(ls.getBankAccountId(), account);
    }
    if ( payerBankAccountID == -1 ) return;
    Long pendingBalance = (Long) account.findBalance(getX());
    List cashins = ((ArraySink) getLocalTransactionDAO().where(
      AND(
        OR(
          EQ(Transaction.STATUS, TransactionStatus.PENDING),
          EQ(Transaction.STATUS, TransactionStatus.PENDING_PARENT_COMPLETED),
          EQ(Transaction.STATUS, TransactionStatus.SENT)
        ),
        INSTANCE_OF(CITransaction.class),
        EQ(Transaction.DESTINATION_ACCOUNT, account.getId())
      )
    ).select(new ArraySink())).getArray();

    for ( Object t: cashins) {
      pendingBalance += ((Transaction) t).getDestinationAmount();
    }

    List cashouts = ((ArraySink) getLocalTransactionDAO().where(
      AND(
        EQ(Transaction.STATUS, TransactionStatus.PENDING_PARENT_COMPLETED),
        INSTANCE_OF(COTransaction.class),
        EQ(Transaction.SOURCE_ACCOUNT, account.getId())
      )
    ).select(new ArraySink())).getArray();

    for ( Object t: cashouts) {
      pendingBalance -= ((Transaction) t).getDestinationAmount();
    }

    long destination;
    long source;
    long amount;
    if ( pendingBalance > ls.getMaximumBalance() ) {
      if ( ! ls.getEnableCashOut() ) return;
      source = account.getId();
      destination = payerBankAccountID;
      amount = pendingBalance - ls.getMaximumBalance();
    } else if ( pendingBalance < ls.getMinimumBalance() ) {
      if ( ! ls.getEnableCashIn() ) return;
      source = payerBankAccountID;
      destination = account.getId();
      amount = ls.getMinimumBalance() - pendingBalance;
    } else return;
    try {
      addCICOTransaction(amount, source, destination, getX());
    }
    catch (Exception e) {
      System.out.print("Liquidity transaction did not go through. " + e);
    }
  }

  /*
  Add cash in and cash out transaction, set transaction type to seperate if it is an cash in or cash out transaction
   */
  public void addCICOTransaction(long amount, long source, long destination, X x)
    throws RuntimeException
  {
    Transaction transaction = new Transaction.Builder(x)
        .setAmount(amount)
        .setDestinationAccount(destination)
        .setSourceAccount(source)
        .build();
    getLocalTransactionDAO().put_(x, transaction);
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
