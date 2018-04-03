package net.nanopay.cico.spi.alterna;

import foam.dao.Sink;
import foam.dao.ArraySink;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;
import foam.lib.csv.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.auth.User;
import net.nanopay.cico.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.model.BankAccount;
import net.nanopay.tx.model.Transaction;

import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.io.*;
import java.util.HashSet;
import java.util.Set;

import static foam.mlang.MLang.*;

public class CsvUtil {

  public CsvUtil() {}

  protected final static ThreadLocal<SimpleDateFormat> filenameSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyyMMdd");
    }
  };

  protected final static ThreadLocal<SimpleDateFormat> csvSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("MM/dd/yyyy");
    }
  };

  /**
   * Generates the process date based on a given date
   * @param date date used to determine the processing date
   * @return either the current date plus 1 day if current time is before 11 am
   *         or the current date plus 2 days if the current date is after 11 am
   */
  public static String generateProcessDate(Date date) {
    Calendar now = Calendar.getInstance();
    now.setTime(date);
    now.add(Calendar.DAY_OF_MONTH, ( now.get(Calendar.HOUR_OF_DAY) < 11 ) ? 1 : 2);
    return csvSdf.get().format(now.getTime());
  }

  /**
   * Generates a reference id by concatentating the current time in milliseconds with a randomly generated number
   * @return a reference id
   */
  public static String generateReferenceId() {
    return new Date().getTime() + "" + (int) (Math.random() * (99999 - 10000) + 10000);
  }

  /**
   * Generates a filename based on a given date
   * @param date date to use in the filename
   * @return the filename
   */
  public static String generateFilename(Date date) {
    return filenameSdf.get().format(date) + "_mintchipcashout.csv";
  }

  /**
   * Pads the left size of a string with zeros
   * @param s string to padd
   * @param n number of 0's to pad with
   * @return the string padded with n number of zeros
   */
  public static String padLeftWithZeros(String s, int n) {
    return String.format("%" + n + "s", s).replace(' ', '0');
  }

  /**
   * fills the outputter with all CICO transactions
   * @param x - the context
   * @param o -  output stream to write to
   * @param mode - outputter mode
   * @return the outputter
   */
  public static void writeCsvFile(X x, OutputStream o, OutputterMode mode) {
    final Date now = new Date();
    final DAO userDAO = (DAO) x.get("localUserDAO");
    final DAO bankAccountDAO = (DAO) x.get("localBankAccountDAO");
    final DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    // add a set to store all CICO Transactionas and their status change to Accept
    ArraySink acceptTransactions = new ArraySink();
    transactionDAO.where(
        OR(
            EQ(Transaction.CICO_STATUS, TransactionStatus.ACCEPTED),
            EQ(Transaction.CICO_STATUS, TransactionStatus.DECLINED),
            EQ(Transaction.CICO_STATUS, TransactionStatus.PENDING))
    ).select(acceptTransactions);
    Set<Long> acceptTransactionsSet = new HashSet();
    for ( Object txn : acceptTransactions.getArray() ) {
      acceptTransactionsSet.add(( (Transaction) txn ).getId());
    }

    Outputter out = new Outputter(o, mode, false);
    transactionDAO.where(
        AND(
            EQ(Transaction.CICO_STATUS, TransactionStatus.NEW),
            OR(
                EQ(Transaction.TYPE, TransactionType.CASHIN),
                EQ(Transaction.TYPE, TransactionType.CASHOUT)
            )
        )
    ).select(new AbstractSink() {

      @Override
      public void put(Object obj, Detachable sub) {
        try {
          User user = null;
          String txnType = null;
          Transaction t = (Transaction) obj;
          // if CICO Transaction is accept, it will not add to CSV file
          if ( acceptTransactionsSet.contains(Long.valueOf(t.getId())) )
            return;

          // get transaction type and user
          if ( t.getType() == TransactionType.CASHIN || t.getType() == TransactionType.VERIFICATION ) {
            txnType = "DB";
            user = (User) userDAO.find(t.getPayeeId());
          } else if ( t.getType() == TransactionType.CASHOUT ) {
            txnType = "CR";
            user = (User) userDAO.find(t.getPayerId());
          } else {
            // don't output if for whatever reason we get here and
            // the transaction is not a cash in or cash out
            return;
          }

          // if user null, return
          if ( user == null ) {
            return;
          }

          // get bank account and check if null
          BankAccount bankAccount = (BankAccount) bankAccountDAO.find(t.getBankAccountId());
          if ( bankAccount == null ) {
            return;
          }

          AlternaFormat alternaFormat = new AlternaFormat();
          boolean isOrganization = (user.getOrganization() != null && !user.getOrganization().isEmpty());
          alternaFormat.setFirstName(!isOrganization ? user.getFirstName() : user.getOrganization());
          alternaFormat.setLastName(!isOrganization ? user.getLastName() : " ");
          alternaFormat.setTransitNumber(padLeftWithZeros(bankAccount.getTransitNumber(), 5));
          alternaFormat.setBankNumber(padLeftWithZeros(bankAccount.getInstitutionNumber(), 3));
          alternaFormat.setAccountNumber(bankAccount.getAccountNumber());
          alternaFormat.setAmountDollar(String.format("$%.2f", (t.getAmount() / 100.0)));
          alternaFormat.setTxnType(txnType);
          alternaFormat.setProcessDate(CsvUtil.generateProcessDate(now));
          alternaFormat.setReference(CsvUtil.generateReferenceId());
          out.put(alternaFormat, sub);
          // if a verification transaction, also add a CR with same information
          if ( t.getType() == TransactionType.VERIFICATION ) {
            AlternaFormat cashout = (AlternaFormat) alternaFormat.fclone();
            cashout.setTxnType("CR");
            out.put(cashout, sub);
          }
          out.flush();
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    });
  }
}
