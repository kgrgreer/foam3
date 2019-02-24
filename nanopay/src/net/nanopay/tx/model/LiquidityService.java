package net.nanopay.tx.model;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.sink.Sum;
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

  protected Logger getLogger() {
    if ( logger_ == null ) {
      logger_ = (Logger) getX().get("logger");
    }
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

  @Override
  public void liquifyAccount(long accountId, Frequency frequency, long txnAmount) {
    LiquiditySettings ls =null;
    ls = (LiquiditySettings) getLiquiditySettingsDAO().find(accountId);
    if ( ls == null || ls.getCashOutFrequency() != frequency ) return;
    executeLiquidity(ls, txnAmount);
  }

  @Override
  public void liquifyFrequency(Frequency frequency ) {
    getLiquiditySettingsDAO().where(EQ(LiquiditySettings.CASH_OUT_FREQUENCY, frequency)).select( new AbstractSink() {
      @Override
      public void put(Object o, Detachable d) {
        LiquiditySettings ls = (LiquiditySettings) o;
        executeLiquidity(ls, 0L);
      }
    });

  }

  public void executeLiquidity(LiquiditySettings ls, Long txnAmount) {
    DigitalAccount account = ls.findAccount(getX());
    if ( account == null ) return;
    Long pendingBalance = (Long) account.findBalance(getX());
    pendingBalance += ((Double)((Sum) getLocalTransactionDAO().where(
      AND(
        OR(
          EQ(Transaction.STATUS, TransactionStatus.PENDING),
          EQ(Transaction.STATUS, TransactionStatus.PENDING_PARENT_COMPLETED),
          EQ(Transaction.STATUS, TransactionStatus.SENT)
        ),
        INSTANCE_OF(CITransaction.class),
        EQ(Transaction.DESTINATION_ACCOUNT, account.getId())
      )
    ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();

    pendingBalance -= ((Double)((Sum)getLocalTransactionDAO().where(
      AND(
        EQ(Transaction.STATUS, TransactionStatus.PENDING_PARENT_COMPLETED),
        INSTANCE_OF(COTransaction.class),
        EQ(Transaction.SOURCE_ACCOUNT, account.getId())
      )
    ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();


    executeHighLiquidity(pendingBalance, ls, txnAmount);

    executeLowLiquidity(pendingBalance, ls, txnAmount);

//    Account liquidityAccount = ls.findBankAccountId(x_);
//    long fundAccount;
//    if ( liquidityAccount != null && liquidityAccount instanceof DigitalAccount ) {
//      fundAccount = liquidityAccount.getId();
//    } else {
//      fundAccount = getBankAccountID(ls.getBankAccountId(), account);
//    }
//    if ( fundAccount == -1 ) return;
//
//
//    long destination;
//    long source;
//    long amount;
//    if ( pendingBalance > ls.getMaximumBalance() ) {
//      amount = pendingBalance - ls.getMaximumBalance();
//      if ( txnAmount > 0 && amount > txnAmount ) {
//        //send notification limit went over
//        notifyUser(account, true, "Account has gone above", ls);
//      }
//      if ( ! ls.getEnableCashOut() ) {
//        if ( txnAmount != 0 ) {
//          //send notification that transaction was made outside of the range
//          notifyUser(account, true, "Transaction was made outside of range", ls);
//        }
//        return;
//      }
//      source = account.getId();
//      destination = fundAccount;
//    } else if ( pendingBalance < ls.getMinimumBalance() ) {
//      amount = ls.getMinimumBalance() - pendingBalance;
//      if ( txnAmount < 0 && amount > -txnAmount ) {
//        //send notification limit went over
//        notifyUser(account, false, "Account has fallen below", ls);
//      }
//      if ( ! ls.getEnableCashIn() ) {
//        if ( txnAmount != 0 ) {
//          //send notification that transaction was made outside of the range
//          notifyUser(account, false, "Transaction was made outside of range", ls);
//        }
//        return;
//      }
//      source = fundAccount;
//      destination = account.getId();
//    } else return;
//    addCICOTransaction(amount, source, destination, getX());

  }

  public void executeHighLiquidity(Long currentBalance, LiquiditySettings ls, long txnAmount) {
    Liquidity liquidity = ls.getHighLiquidity();
    Account account = ls.findAccount(x_);

    Account fundAccount = liquidity.findFundAccount(x_);
    if ( ! ( fundAccount instanceof DigitalAccount ) ) {
      fundAccount = BankAccount.findDefault(x_, account.findOwner(x_), account.getDenomination());
    }
    if ( fundAccount == null ) {
      Notification notification = new Notification();
      notification.setNotificationType("No verified bank account for liquidity settings");
      notification.setBody("You need to add and verify bank account for liquidity settings");
      notification.setUserId(account.getOwner());
      ((DAO) x_.get("notificationDAO")).put(notification);
      return;
    }


    if ( currentBalance > liquidity.getThreshold() ) {
      if ( txnAmount > 0 && currentBalance - liquidity.getThreshold() > txnAmount ) {
        //send notification when limit went over
        notifyUser(account, true, "Account has gone above", ls);
      }
      if ( liquidity.getEnable() ) {
        addCICOTransaction(currentBalance - liquidity.getReset(),account.getId(), fundAccount.getId());
      }
    }
  }

  public void executeLowLiquidity(Long currentBalance, LiquiditySettings ls, long txnAmount) {

    Liquidity liquidity = ls.getLowLiquidity();

    if ( currentBalance < liquidity.getThreshold() ) {
      Account account = ls.findAccount(x_);
      if ( txnAmount < 0 && currentBalance + txnAmount >  liquidity.getThreshold() ) {
        //send notification when limit went over
        notifyUser(account, false, "Account has gone below", ls);
      }
      Account fundAccount = liquidity.findFundAccount(x_);
      if ( ! ( fundAccount instanceof DigitalAccount ) ) {
        fundAccount = BankAccount.findDefault(x_, account.findOwner(x_), account.getDenomination());
      }
      if ( fundAccount == null ) {
        Notification notification = new Notification();
        notification.setNotificationType("No verified bank account for liquidity settings");
        notification.setBody("You need to add and verify bank account for liquidity settings");
        notification.setUserId(account.getOwner());
        ((DAO) x_.get("notificationDAO")).put(notification);
        return;
      }
      if ( liquidity.getEnable() ) {
        addCICOTransaction(liquidity.getReset() - currentBalance, fundAccount.getId(), account.getId());
      }
    }

  }

  public void notifyUser(Account account, Boolean above, String notifType, LiquiditySettings ls) {
    Notification notification = new Notification();
    if ( above ) {
      notification.setBody("Hi, " + account.findOwner(x_).getFirstName() + ". Account " + account.getName() + " has gone above maximum value of " );
    } else {
      notification.setBody("Hi, " + account.findOwner(x_).getFirstName() + ". Account " + account.getName() + " has fallen below minimum value of ");
    }
    notification.setEmailIsEnabled(true);
    notification.setNotificationType(notifType);
    notification.setUserId(account.getOwner());
    ((DAO) x_.get("notificationDAO")).put(notification);
  }

  /*
  Add cash in and cash out transaction, set transaction type to seperate if it is an cash in or cash out transaction
   */
  public void addCICOTransaction(long amount, long source, long destination)
    throws RuntimeException
  {
    Transaction transaction = new Transaction.Builder(x_)
        .setAmount(amount)
        .setDestinationAccount(destination)
        .setSourceAccount(source)
        .build();
    try {
      getLocalTransactionDAO().put_(x_, transaction);
    } catch (Exception e) {
      getLogger().error("Error generating Liquidity transactions.", e);
      Notification notification = new Notification();
      notification.setTemplate("NOC");
      notification.setBody("Error generating Liquidity transactions. "+e.getMessage());
      ((DAO) x_.get("notificationDAO")).put(notification);
    }
  }

  public Account getBankAccount(long lsBankId, Account account) {
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
      return null;
    }

    return bankAccount;
  }
}
