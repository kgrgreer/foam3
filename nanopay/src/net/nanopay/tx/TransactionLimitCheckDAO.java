package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import static foam.mlang.MLang.*;
import foam.mlang.sink.Sum;
import foam.nanos.auth.User;
import net.nanopay.model.Account;
import net.nanopay.tx.model.Transaction;
import java.util.Calendar;
import java.util.Date;


public class TransactionLimitCheckDAO
        extends ProxyDAO {

  public TransactionLimitCheckDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public TransactionLimitCheckDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  private static final String DEFAULT_USER_NAME = "default_user";

  @Override
  public FObject put_(X x, FObject fObject) throws RuntimeException {
    Transaction transaction = (Transaction) fObject;
    DAO userDAO = (DAO) x.get("localUserDAO");
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    DAO transactionDAO = (DAO) x.get("transactionDAO");

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
          Account account;

          //Splits the current day/month/year into their own variables
          Calendar calendar = Calendar.getInstance();
          calendar.setTime(new Date());
          int year = calendar.get(Calendar.YEAR);
          int month = calendar.get(Calendar.MONTH);
          int day = calendar.get(Calendar.DAY_OF_MONTH);

          //Sets the beginning and end of the year
          Calendar yearStart = Calendar.getInstance();
          Calendar yearEnd = Calendar.getInstance();
          yearStart.set(year,0 ,1, 0, 0, 0);
          yearEnd.set(year+1, 0, 1, 0, 0, 0);
          yearEnd.setTimeInMillis(yearEnd.getTimeInMillis()- 1000);

          //Sets the beginning and end of the month
          Calendar monthStart = Calendar.getInstance();
          Calendar monthEnd = Calendar.getInstance();
          monthStart.set(year, month, 1 , 0, 0, 0);
          monthEnd.set(year, month+1, 1, 0, 0, 0);
          monthEnd.setTimeInMillis(monthEnd.getTimeInMillis()- 1000);

          //Sets the beginning and end of the week
          Calendar weekStart = Calendar.getInstance();
          weekStart.set(Calendar.DAY_OF_WEEK, weekStart.getFirstDayOfWeek());
          weekStart.set(Calendar.HOUR_OF_DAY, 0);
          weekStart.clear(Calendar.MINUTE);
          weekStart.clear(Calendar.SECOND);
          Calendar weekEnd = (Calendar) weekStart.clone();
          weekEnd.add(Calendar.DAY_OF_YEAR, 7);
          weekEnd.setTimeInMillis(weekEnd.getTimeInMillis()- 1000);

          //Sets the beginning and end of the day
          Calendar dayStart = Calendar.getInstance();
          Calendar dayEnd = Calendar.getInstance();
          dayStart.set(year, month, day, 0, 0, 0);
          dayEnd.set(year, month, day+1, 0, 0, 0);
          dayEnd.setTimeInMillis(dayEnd.getTimeInMillis()- 1000);

          //Checks if the transaction has a payer
          if (payer != null) {

            //Makes a shortcut for accessing default limits for payer to set all values to the default
            account = (Account) accountDAO.find(payer.getId());
            long[] payerLimit = { account.getLimit().getYearlyLimit(), account.getLimit().getMonthlyLimit(), account.getLimit().getWeeklyLimit(), account.getLimit().getDailyLimit()};

            //Checks if payer has any special limit conditions
            if (payer.getTransactionLimits().length > 0) payerLimit = setSpecialLimits(payer, payerLimit);

            //Grabs all tranasactions user made as payer within the year and compares it to current transaction to see if they have violated yearly limit
            DAO payerTransaction = transactionDAO.where(AND(EQ(payer.getId(), Transaction.PAYER_ID), AND(GTE(Transaction.DATE, yearStart.getTime()), LTE(Transaction.DATE, yearEnd.getTime()))));
            transactionTotal = getTransactionAmounts(payerTransaction);
            if (transaction.getAmount() + transactionTotal > payerLimit[0])
              throw new RuntimeException("Transaction amount is over Payers yearly limit");

            //Grabs all tranasactions user made as payer within the month and compares it to current transaction to see if they have violated monthly limit
            payerTransaction = payerTransaction.where(AND(GTE(Transaction.DATE, monthStart.getTime()), LTE(Transaction.DATE, monthEnd.getTime())));
            transactionTotal = getTransactionAmounts(payerTransaction);
            if (transaction.getAmount() + transactionTotal > payerLimit[1])
              throw new RuntimeException("Transaction amount is over Payers monthly limit");

            //Grabs all tranasactions user made as payer within the week and compares it to current transaction to see if they have violated weekly limit
            payerTransaction = payerTransaction.where(AND(GTE(Transaction.DATE, weekStart.getTime()), LTE(Transaction.DATE, weekEnd.getTime())));
            transactionTotal = getTransactionAmounts(payerTransaction);
            if (transaction.getAmount() + transactionTotal > payerLimit[2])
              throw new RuntimeException("Transaction amount is over Payers weekly limit");

            //Grabs all tranasactions user made as payer within the month and compares it to current transaction to see if they have violated monthly limit
            payerTransaction = payerTransaction.where(AND(GTE(Transaction.DATE, dayStart.getTime()), LTE(Transaction.DATE, dayEnd.getTime())));
            transactionTotal = getTransactionAmounts(payerTransaction);
            if (transaction.getAmount() + transactionTotal > payerLimit[3])
              throw new RuntimeException("Transaction amount is over Payers daily limit");
          }
          if (payee != null) {

            //Makes a shortcut for accessing default limits for payee to set all values to the default
            account = (Account) accountDAO.find(payee.getId());
            long[] payeeLimit = { account.getLimit().getYearlyLimit(), account.getLimit().getMonthlyLimit(), account.getLimit().getWeeklyLimit(), account.getLimit().getDailyLimit()};

            //Checks for special limits of User and overrides the default
            if (payee.getTransactionLimits().length > 0)
              payeeLimit = setSpecialLimits(payee, payeeLimit);

            //Query all transactions within the year
            DAO payeeTransaction = transactionDAO.where(AND(EQ(payee.getId(), Transaction.PAYEE_ID), AND(GTE(Transaction.DATE, yearStart.getTime()), LTE(Transaction.DATE, yearEnd.getTime()))));
            transactionTotal = getTransactionAmounts(payeeTransaction);

            if (transaction.getAmount() + transactionTotal > payeeLimit[0])
              throw new RuntimeException("Transaction amount is over Payees yearly limit");

            //Query all transactions within the month
            payeeTransaction = payeeTransaction.where(AND(GTE(Transaction.DATE, monthStart.getTime()), LTE(Transaction.DATE, monthEnd.getTime())));
            transactionTotal = getTransactionAmounts(payeeTransaction);

            if (transaction.getAmount() + transactionTotal > payeeLimit[1])
              throw new RuntimeException("Transaction amount is over Payees monthly limit");

            //Query all transactions within the week
            payeeTransaction = payeeTransaction.where(AND(GTE(Transaction.DATE, weekStart.getTime()), LTE(Transaction.DATE, weekEnd.getTime())));
            transactionTotal = getTransactionAmounts(payeeTransaction);

            if (transaction.getAmount() + transactionTotal > payeeLimit[2])
              throw new RuntimeException("Transaction amount is over Payees weekly limit");


            //Query all transactions within the day
            payeeTransaction = payeeTransaction.where(AND(GTE(Transaction.DATE, dayStart.getTime()), LTE(Transaction.DATE, dayEnd.getTime())));
            transactionTotal = getTransactionAmounts(payeeTransaction);

            if (transaction.getAmount() + transactionTotal > payeeLimit[3])
              throw new RuntimeException("Transaction amount is over Payees daily limit");
          }
          return getDelegate().put_(x,transaction);

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
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
  private long getTransactionAmounts(DAO list) {
    return ((Double)(((Sum) list.select(SUM(Transaction.AMOUNT))).getValue())).longValue();
  }
}
