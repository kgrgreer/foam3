package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import net.nanopay.model.Account;
import net.nanopay.model.AccountLimit;
import net.nanopay.tx.model.Transaction;

import java.util.Calendar;
import java.util.Date;
import java.util.List;


public class TransactionLimitCheckDAO
        extends ProxyDAO
{
  public TransactionLimitCheckDAO(DAO delegate) {
    setDelegate(delegate);
  }

  private static final String DEFAULT_USER_NAME = "default_user";

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    DAO userDAO = (DAO) x.get("localUserDAO");
    DAO branchDAO = (DAO) x.get("branchDAO");
    DAO bankAccountDAO = (DAO) x.get("bankAccountDAO");
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    DAO transactionLimitDAO = (DAO) x.get("transactionLimitDAO");
    Transaction transaction = (Transaction) obj;
    // TODO: find out if theres a way to have a watch on a boolean for limit Violation
    Boolean limitViolation = false;
    if ( transaction.getBankAccountId() == null ) {
      throw new RuntimeException("Invalid bank account");
    }

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          User payee = (User) userDAO.find(transaction.getPayeeId());
          User payer = (User) userDAO.find(transaction.getPayerId());

          //Holds total amount from transactions
          long transactionTotal = 0;

          //Query all transactions within the year
          Sink payeeTransaction = (Sink) transactionDAO.where(MLang.AND(MLang.EQ(payee.getId(),transaction.getPayeeId()),MLang.EQ(getTime(transaction.getDate()).get(Calendar.YEAR),getTime(new Date()).get(Calendar.YEAR))));
          Sink payerTransaction = (Sink) transactionDAO.where(MLang.AND(MLang.EQ(payer.getId(),transaction.getPayerId()),MLang.EQ(getTime(transaction.getDate()).get(Calendar.YEAR),getTime(new Date()).get(Calendar.YEAR))));

          //Makes a shortcut for accessing default limits for payer to set all values to the default
          AccountLimit defaultLimit = ((Account)payer.getAccounts()[0]).getLimit();
          long[] payerLimit = {defaultLimit.getYearlyLimit(),defaultLimit.getMonthlyLimit(),defaultLimit.getWeeklyLimit(),defaultLimit.getDailyLimit()};

          //Makes a shortcut for accessing default limits for payee to set all values to the default
          defaultLimit = ((Account)payee.getAccounts()[0]).getLimit();
          long[] payeeLimit = {defaultLimit.getYearlyLimit(),defaultLimit.getMonthlyLimit(),defaultLimit.getWeeklyLimit(),defaultLimit.getDailyLimit()};

          //Checks for special limits of User and overrides the default
          if (payer.getTransactionLimits().length>0) payerLimit = setSpecialLimits(payer, payerLimit);
          if (payee.getTransactionLimits().length>0) payeeLimit = setSpecialLimits(payee, payeeLimit);

          transactionTotal = getTransactionAmounts(payerTransaction);
          if (transaction.getAmount()+transactionTotal>payerLimit[0]) limitViolation = true;
          transactionTotal = getTransactionAmounts(payeeTransaction);
          if (transaction.getAmount()+transactionTotal>payeeLimit[0]) limitViolation = true;

          payerTransaction = (Sink) transactionDAO.where(MLang.AND(MLang.EQ(payer.getId(),transaction.getPayerId()), MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.YEAR),getTime(new Date()).get(Calendar.YEAR)),MLang.EQ(getTime(transaction.getDate()).get(Calendar.MONTH),getTime(new Date()).get(Calendar.MONTH)))));
          payeeTransaction = (Sink) transactionDAO.where(MLang.AND(MLang.EQ(payee.getId(),transaction.getPayeeId()), MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.YEAR),getTime(new Date()).get(Calendar.YEAR)),MLang.EQ(getTime(transaction.getDate()).get(Calendar.MONTH),getTime(new Date()).get(Calendar.MONTH)))));

          transactionTotal = getTransactionAmounts(payerTransaction);
          if (transaction.getAmount()+transactionTotal>payerLimit[1]) limitViolation = true;
          transactionTotal = getTransactionAmounts(payeeTransaction);
          if (transaction.getAmount()+transactionTotal>payeeLimit[1]) limitViolation = true;

          payerTransaction = (Sink) transactionDAO.where(MLang.AND(MLang.EQ(payer.getId(),transaction.getPayerId()),MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.YEAR),getTime(new Date()).get(Calendar.YEAR)), MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.MONTH),getTime(new Date()).get(Calendar.MONTH)), MLang.EQ(getTime(transaction.getDate()).get(Calendar.WEEK_OF_MONTH),getTime(new Date()).get(Calendar.WEEK_OF_MONTH))))));
          payeeTransaction = (Sink) transactionDAO.where(MLang.AND(MLang.EQ(payee.getId(),transaction.getPayeeId()),MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.YEAR),getTime(new Date()).get(Calendar.YEAR)), MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.MONTH),getTime(new Date()).get(Calendar.MONTH)), MLang.EQ(getTime(transaction.getDate()).get(Calendar.WEEK_OF_MONTH),getTime(new Date()).get(Calendar.WEEK_OF_MONTH))))));

          transactionTotal = getTransactionAmounts(payerTransaction);
          if (transaction.getAmount()+transactionTotal>payerLimit[2]) limitViolation = true;
          transactionTotal = getTransactionAmounts(payeeTransaction);
          if (transaction.getAmount()+transactionTotal>payeeLimit[2]) limitViolation = true;



          payerTransaction = (Sink) transactionDAO.where(MLang.AND(MLang.EQ(payer.getId(),transaction.getPayerId()),MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.YEAR),getTime(new Date()).get(Calendar.YEAR)), MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.MONTH),getTime(new Date()).get(Calendar.MONTH)), MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.WEEK_OF_MONTH),getTime(new Date()).get(Calendar.WEEK_OF_MONTH)), MLang.EQ(getTime(transaction.getDate()).get(Calendar.DAY_OF_MONTH),getTime(new Date()).get(Calendar.DAY_OF_MONTH)))))));
          payeeTransaction = (Sink) transactionDAO.where(MLang.AND(MLang.EQ(payee.getId(),transaction.getPayeeId()),MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.YEAR),getTime(new Date()).get(Calendar.YEAR)), MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.MONTH),getTime(new Date()).get(Calendar.MONTH)),   MLang.AND(MLang.EQ(getTime(transaction.getDate()).get(Calendar.WEEK_OF_MONTH),getTime(new Date()).get(Calendar.WEEK_OF_MONTH)), MLang.EQ(getTime(transaction.getDate()).get(Calendar.DAY_OF_MONTH),getTime(new Date()).get(Calendar.DAY_OF_MONTH)))))));

          transactionTotal = getTransactionAmounts(payerTransaction);
          if (transaction.getAmount()+transactionTotal>payerLimit[3]) limitViolation = true;
          transactionTotal = getTransactionAmounts(payeeTransaction);
          if (transaction.getAmount()+transactionTotal>payeeLimit[3]) limitViolation = true;


          return getDelegate().put(transaction);

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
  Calendar getTime(Date date) {
    Calendar calendar = Calendar.getInstance();
    calendar.setTime(date);
    return calendar;
  }
  long[] setSpecialLimits(User user, long[] limits) {
    for (int i=0; i<user.getTransactionLimits().length;i++) {
      switch(user.getTransactionLimits()[i].getTimeFrame().name()) {
        case "DAY":
          limits[3] = user.getTransactionLimits()[i].getAmount();
          break;
        case "WEEKLY":
          limits[2]= user.getTransactionLimits()[i].getAmount();
          break;
        case "MONTHLY":
          limits[1]= user.getTransactionLimits()[i].getAmount();
          break;
        case "YEARLY":
          limits[0] = user.getTransactionLimits()[i].getAmount();
          break;
      }
    }
    return limits;
  }
  long getTransactionAmounts(Sink list)
  {
    long total=0;
    for (Transaction trans: (List<Transaction>)list) {
      total = trans.getAmount();
    }
    return total;
  }
}
