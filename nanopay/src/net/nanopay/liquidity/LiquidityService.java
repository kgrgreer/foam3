package net.nanopay.liquidity;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;
import static foam.mlang.MLang.OR;
import static foam.mlang.MLang.SUM;

import java.text.NumberFormat;
import java.util.HashMap;

import foam.core.ContextAwareSupport;
import foam.core.Currency;
import foam.core.Detachable;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.sink.Sum;
import foam.nanos.app.AppConfig;
import foam.nanos.app.Mode;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.account.BalanceService;
import net.nanopay.account.DigitalAccount;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.tx.ComplianceTransaction;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.SourceLineItem;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.util.Frequency;

public class LiquidityService
  extends    ContextAwareSupport
  implements LiquidityAuth
{
  protected DAO    userDAO_;
  protected DAO    accountDAO_;
  protected DAO    liquiditySettingsDAO_;
  protected DAO    transactionDAO_;
  protected Logger logger_;
  protected BalanceService balanceService_;

  protected Logger getLogger() {
    if ( logger_ == null ) {
      logger_ = (Logger) getX().get("logger");
    }
    return logger_;
  }

  protected DAO getUserDAO() {
    if ( userDAO_ == null ) userDAO_ = (DAO) getX().get("localUserDAO");

    return userDAO_;
  }
  protected DAO getAccountDAO() {
    if ( accountDAO_ == null ) accountDAO_ = (DAO) getX().get("localAccountDAO");

    return accountDAO_;
  }
  protected BalanceService getBalanceService() {
    if ( balanceService_ == null ) balanceService_ = (BalanceService) getX().get("balanceService");

    return balanceService_;
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
  public void liquifyAccount(String accountId, Frequency frequency, long txnAmount) {
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
    // set context tag
    x_ = x_.put("systemGenerated","liquidityService");

    long pendingBalance =  getBalanceService().findBalance_(getX(),account);
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

    if ( ls.getHighLiquidity().getEnabled() )
      executeHighLiquidity(pendingBalance, ls, txnAmount, account);
    if ( ls.getLowLiquidity().getEnabled() )
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
      if ( liquidity.getRebalancingEnabled() ) {
        Account fundAccount = validatePushPullAccount(account, liquidity.findPushPullAccount(x_));
        if ( fundAccount == null )
          return;

        if ( liquidity.getResetBalance() != currentBalance ) {
          addCICOTransaction(currentBalance - liquidity.getResetBalance(), account.getId(), fundAccount.getId(), ls);
        }
      }

      if ( txnAmount >= 0 && currentBalance - txnAmount <= liquidity.getThreshold() ) {
        //send notification when limit went over
        notifyUser(account, ls, liquidity, ls.findUserToEmail(x_) == null ? account.getOwner() : ls.getUserToEmail());
      }
    }
  }

  public void executeLowLiquidity( long currentBalance, LiquiditySettings ls, long txnAmount, DigitalAccount account ) {
    Liquidity liquidity = ls.getLowLiquidity();

    if ( currentBalance <= liquidity.getThreshold() ) {
      if ( liquidity.getRebalancingEnabled() ) {
        Account fundAccount = validatePushPullAccount(account, liquidity.findPushPullAccount(x_));
        if ( fundAccount == null )
          return;

        if ( liquidity.getResetBalance() != currentBalance ) {
          addCICOTransaction(liquidity.getResetBalance() - currentBalance, fundAccount.getId(), account.getId(), ls);
        }
      }

      if ( txnAmount <= 0 && currentBalance - txnAmount >= liquidity.getThreshold() ) {
        //send notification when limit went over
        notifyUser(account, ls, liquidity, ls.findUserToEmail(x_) == null ? account.getOwner() : ls.getUserToEmail());
      }
    }
  }

  public Account validatePushPullAccount(DigitalAccount account, Account fundAccount) {
    if ( ! ( fundAccount instanceof DigitalAccount ) ) {
      fundAccount = BankAccount.findDefault(x_, account.findOwner(x_), account.getDenomination());
    }

    if ( fundAccount == null ) {
      Notification notification = new Notification();
      notification.setNotificationType("No verified bank account for liquidity settings");
      notification.setBody("You need to add and verify bank account for liquidity settings");
      User user = (User) getUserDAO().find(account.getOwner());

      if ( user != null ) {
        user.doNotify(x_, notification);
      }
    }

    return fundAccount;
  }

  public void notifyUser( Account account, LiquiditySettings ls, Liquidity liquidity, long recipient ) {
    var notification = new LiquidNotification();
    var args = new HashMap<String, Object>();
    var user = account.findOwner(x_);
    var url = user.findGroup(getX()).getAppConfig(getX()).getUrl();
    var notificationBody = "";
    var threshold = "";
    var emailName = "";

    var currency = (Currency) ((DAO) x_.get("currencyDAO")).find(ls.findDenomination(x_));
    if ( currency != null) {
      threshold = currency.format(liquidity.getThreshold());
    } else {
      threshold = NumberFormat.getCurrencyInstance().format(liquidity.getThreshold()/100.00);
    }

    args.put("title",           "Liquidity Threshold Alert");
    args.put("liquidity_name",  ls.getName());
    args.put("threshold",       threshold);
    args.put("link",            url);

    if ( liquidity.getRebalancingEnabled() ) {
      emailName = "liquidityNotificationSweep";

      args.put("src_account_name",    account.getName());
      args.put("src_account_id",      account.getId());

      Account dstAccount = (Account) ((DAO)getX().get("localAccountDAO")).find(liquidity.getPushPullAccount());
      String dstAccountName = "";
      String dstAccountId = "";
      if ( dstAccount != null ) {
        dstAccountName = dstAccount.getName();
        dstAccountId = dstAccount.getId();
      }

      args.put("dst_account_name",    dstAccountName);
      args.put("dst_account_id",     dstAccountId);

      notificationBody = String.format(
        "The %s for %s has been reached\nFunds have automatically moved between %s & %s and %s & %s",
        threshold, ls.getName(), account.getName(), account.getId(), dstAccountName, dstAccountId
      );
    } else {
      emailName = "liquidityNotification";

      args.put("account_name",    account.getName());
      args.put("account_id",      account.getId());

      notificationBody = String.format(
        "The %s for %s has been reached for %s & %s",
        threshold, ls.getName(), account.getName(), account.getId()
      );
    }

    if ( ! SafetyUtil.isEmpty(emailName) ) {
      notification.setEmailName(emailName);
      notification.setEmailArgs(args);
    }

    notification.setNotificationType("Liquidity Setting");
    notification.setBody(notificationBody);

    var recipientUser = (User) getUserDAO().find(recipient);
    if ( recipientUser != null ) {
      notification.setCreatedBy(recipientUser.getId());
      notification.setUserId(recipientUser.getId());
      recipientUser.doNotify(x_, notification);
    }
  }

  //Add cash in and cash out transaction, set transaction type to separate if it is an cash in or cash out transaction

  public void addCICOTransaction(long amount, String source, String destination, LiquiditySettings ls)
    throws RuntimeException
  {
    Transaction transaction = new Transaction.Builder(x_)
        .setAmount(amount)
        .setDestinationAccount(destination)
        .setSourceAccount(source)
        .build();
    SourceLineItem sli = new SourceLineItem();
    TransactionLineItem[] tlis = new TransactionLineItem[1];
    sli.setNote("LiquidityService");
    tlis[0] = sli;
    transaction.addLineItems(tlis);
    try {
      Transaction tx = (Transaction) getLocalTransactionDAO().put_(x_, transaction);
      if ( tx instanceof ComplianceTransaction &&
        ( ( (AppConfig) x_.get("appConfig") ).getMode() == Mode.TEST || ( (AppConfig) x_.get("appConfig") ).getMode() == Mode.DEVELOPMENT ) ) {
        DAO approvalDAO = (DAO) x_.get("approvalRequestDAO");
        ApprovalRequest request = (ApprovalRequest) approvalDAO.find(AND(EQ(ApprovalRequest.OBJ_ID, tx.getId()), EQ(ApprovalRequest.SERVER_DAO_KEY, "localTransactionDAO"))).fclone();
        request.setStatus(ApprovalStatus.APPROVED);
        approvalDAO.put_(x_, request);
      }
    } catch (Exception e) {
      Notification notification = new Notification();
      notification.setNotificationType("Failure to Rebalance");
      notification.setBody("An error occurred and the rebalancing operation for liquidity setting "+ls.getName()+" has failed.");
      User user = (User) getUserDAO().find(ls.getUserToEmail());
      if ( user != null ) {
        user.doNotify(x_, notification);
      }
    }
  }

}
