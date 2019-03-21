package net.nanopay.liquidity;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.sink.Sum;
import foam.nanos.app.AppConfig;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.liquidity.Liquidity;
import net.nanopay.liquidity.LiquiditySettings;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.text.NumberFormat;
import java.util.HashMap;

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
    LiquiditySettings ls;
    DigitalAccount account = (DigitalAccount) ((DAO) x_.get("localAccountDAO")).find(accountId);
    ls = account.findLiquiditySetting(getX());
    if ( ls == null || ls.getCashOutFrequency() != frequency ) return;
    executeLiquidity(ls, account, txnAmount);
  }

  @Override
  public void liquifyFrequency(Frequency frequency ) {
    getLiquiditySettingsDAO().where(EQ(LiquiditySettings.CASH_OUT_FREQUENCY, frequency)).select( new AbstractSink() {
      @Override
      public void put(Object o, Detachable d) {
        LiquiditySettings ls = (LiquiditySettings) o;
        executePerLiquiditySetting(ls, 0L);
      }
    });

  }

  public void executeLiquidity(LiquiditySettings ls, DigitalAccount account, long txnAmount) {
    long pendingBalance = (long) account.findBalance(getX());
    pendingBalance += ((Double) ((Sum) getLocalTransactionDAO().where(
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

    pendingBalance -= ((Double) ((Sum) getLocalTransactionDAO().where(
      AND(
        EQ(Transaction.STATUS, TransactionStatus.PENDING_PARENT_COMPLETED),
        INSTANCE_OF(COTransaction.class),
        EQ(Transaction.SOURCE_ACCOUNT, account.getId())
      )
    ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();


    executeHighLiquidity(pendingBalance, ls, txnAmount, account);

    executeLowLiquidity(pendingBalance, ls, txnAmount, account);
  }


  public void executePerLiquiditySetting(LiquiditySettings ls, long txnAmount) {
    ls.getAccounts(getX())
      .select(new AbstractSink() {
        @Override
        public void put(Object o, Detachable d) {
          DigitalAccount account = (DigitalAccount) ((DigitalAccount) o).fclone();
          executeLiquidity(ls, account, txnAmount);
        }
      });
  }

  public void executeHighLiquidity( long currentBalance, LiquiditySettings ls, long txnAmount, DigitalAccount account ) {

    Liquidity liquidity = ls.getHighLiquidity();

    if ( currentBalance >= liquidity.getThreshold() ) {
      Account fundAccount = liquidity.findPushPullAccount(x_);
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

      if ( txnAmount >= 0 && currentBalance - txnAmount <= liquidity.getThreshold() ) {
        //send notification when limit went over
        notifyUser(account, true, ls.getHighLiquidity().getThreshold());
      }
      if ( liquidity.getEnableRebalancing() && currentBalance - liquidity.getResetBalance() != 0 ) {
        addCICOTransaction(currentBalance - liquidity.getResetBalance(),account.getId(), fundAccount.getId());
      }
    }
  }

  public void executeLowLiquidity( long currentBalance, LiquiditySettings ls, long txnAmount, DigitalAccount account ) {

    Liquidity liquidity = ls.getLowLiquidity();

    if ( currentBalance <= liquidity.getThreshold() ) {
      Account fundAccount = liquidity.findPushPullAccount(x_);
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
      if ( txnAmount <= 0 && currentBalance - txnAmount >= liquidity.getThreshold() ) {
        //send notification when limit went over
        notifyUser(account, false, ls.getLowLiquidity().getThreshold());
      }
      if ( liquidity.getEnableRebalancing() && liquidity.getResetBalance() - currentBalance != 0 ) {
        addCICOTransaction(liquidity.getResetBalance() - currentBalance, fundAccount.getId(), account.getId());
      }
    }

  }

  public void notifyUser( Account account, boolean above, long threshold ) {
    Notification notification = new Notification();
    notification.setEmailName("liquidityNotification");
    HashMap<String, Object> args = new HashMap<>();
    String direction;
    if ( above ) {
      direction = "has gone above ";
    } else {
      direction = "has fallen below ";
    }
    AppConfig appConfig = (AppConfig) x_.get("appConfig");
    NumberFormat formatter = NumberFormat.getCurrencyInstance();
    
    args.put("account",     "your account "+account.getName()+",");
    args.put("greeting",     "Hi");
    args.put("name",        account.findOwner(x_).getFirstName());
    args.put("direction",   direction);
    args.put("threshold",   formatter.format(threshold/100.00));
    args.put("link",        appConfig.getUrl());

    notification.setEmailArgs(args);
    notification.setEmailIsEnabled(true);
    notification.setUserId(account.getOwner());
    ((DAO) x_.get("notificationDAO")).put(notification);
  }

  //Add cash in and cash out transaction, set transaction type to seperate if it is an cash in or cash out transaction

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

}
