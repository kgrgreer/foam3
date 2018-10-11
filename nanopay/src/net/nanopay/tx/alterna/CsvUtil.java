package net.nanopay.tx.alterna;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.lib.csv.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import static foam.mlang.MLang.*;

public class CsvUtil {

  public CsvUtil() {}

  protected final static ThreadLocal<SimpleDateFormat> filenameSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyyMMdd");
    }
  };

  public final static ThreadLocal<SimpleDateFormat> csvSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("MM/dd/yyyy");
    }
  };

  public final static List<Integer> cadHolidays = Arrays.asList(1, 50, 89, 141, 183, 218, 246, 281, 316, 359, 360);

  /**
   * Generates the process date based on a given date
   * @param date date used to determine the processing date
   * @return either the current date plus 1 day if current time is before cutOffTime (default 11 am）
   *         or the current date plus 2 days if the current date is after cutOffTime
   */
  public static Date generateProcessDate(X x, Date date) {
    AlternaSFTPService alternaSFTPService = (AlternaSFTPService) x.get("alternaSftp");
    int cutOffTime = alternaSFTPService.getCutOffTime();

    Calendar curDate = Calendar.getInstance();
    curDate.setTime(date);
    int k = curDate.get(Calendar.HOUR_OF_DAY) < cutOffTime ? 1 : 2;
    int i = 0;
    while ( i < k ) {
      curDate.add(Calendar.DAY_OF_YEAR, 1);
      if ( curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
        && curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY
        && ! cadHolidays.contains(curDate.get(Calendar.DAY_OF_YEAR)) ) {
        i = i + 1;
      }
    }
    return curDate.getTime();
  }

  /**
   * Generates the completion date based on a given date
   * @param date date used to determine the processing date
   * @return either the current date plus (1 + holdTimeInBusinessDays) days if current time is before cutOffTime (default 11 am）
   *         or the current date plus (2 + holdTimeInBusinessDays) days if the current date is after cutOffTime
   */
  public static Date generateCompletionDate(X x, Date date) {
    AlternaSFTPService alternaSFTPService = (AlternaSFTPService) x.get("alternaSftp");
    int cutOffTime = alternaSFTPService.getCutOffTime();
    int holdTimeInBusinessDays = alternaSFTPService.getHoldTimeInBusinessDays();

    Calendar curDate = Calendar.getInstance();
    curDate.setTime(date);
    int k = curDate.get(Calendar.HOUR_OF_DAY) < cutOffTime ? (1 + holdTimeInBusinessDays) : (2 + holdTimeInBusinessDays);
    int i = 0;
    while ( i < k ) {
      curDate.add(Calendar.DAY_OF_YEAR, 1);
      if ( curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
        && curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY
        && ! cadHolidays.contains(curDate.get(Calendar.DAY_OF_YEAR)) ) {
        i = i + 1;
      }
    }
    return curDate.getTime();
  }

  /**
   * Generates a filename based on a given date
   * @param date date to use in the filename
   * @return the filename
   */
  public static String generateFilename(Date date) {
    return filenameSdf.get().format(date) + "_B2B.csv";
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
    final Date now            = new Date();

    final DAO  bankAccountDAO = (DAO) x.get("localAccountDAO");
    final DAO  transactionDAO = (DAO) x.get("localTransactionDAO");
    final DAO  userDAO        = (DAO) x.get("localUserDAO");
    Logger logger = (Logger) x.get("logger");
    Outputter out = new Outputter(o, mode, false);
    transactionDAO
      .where(
             AND(
                 EQ(Transaction.STATUS, TransactionStatus.PENDING),
                 OR(
                    INSTANCE_OF(AlternaCITransaction.class),
                    INSTANCE_OF(AlternaCOTransaction.class)
                    )
                 )
             )
      .select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        try {
          User user;
          String txnType;
          String refNo;
          Transaction t = (Transaction) ((Transaction) obj).fclone();

          user = (User) userDAO.find_(x,((Account) t.findSourceAccount(x)).getOwner());
          // if user null, return
          if ( user == null ) return;

          BankAccount bankAccount = null;
          if ( t instanceof AlternaCITransaction ) {
            txnType = "DB";
            bankAccount = (BankAccount) t.findSourceAccount(x);
          } else {
            txnType = "CR";
            bankAccount = (BankAccount) t.findDestinationAccount(x);
          }

          // get bank account and check if null
          if ( bankAccount == null ) return;

          // use transaction ID as the reference number
          refNo = String.valueOf(t.getId());

          boolean isOrganization = (user.getOrganization() != null && !user.getOrganization().isEmpty());
          AlternaFormat alternaFormat = new AlternaFormat();

          alternaFormat.setFirstName(!isOrganization ? user.getFirstName() : user.getOrganization());
          alternaFormat.setLastName(!isOrganization ? user.getLastName() : "");
          alternaFormat.setTransitNumber(padLeftWithZeros(String.valueOf((bankAccount.getBranch())), 5));
          alternaFormat.setBankNumber(padLeftWithZeros(String.valueOf((bankAccount.getInstitution())), 3));
          alternaFormat.setAccountNumber(bankAccount.getAccountNumber());
          alternaFormat.setAmountDollar(String.format("$%.2f", (t.getAmount() / 100.0)));
          alternaFormat.setTxnType(txnType);

          // Unfortunately have to duplicate for each of CI and CO
          if ( t instanceof AlternaCITransaction ) {
            AlternaCITransaction txn = (AlternaCITransaction) t;

            // if transaction padType is set, write it to csv. otherwise set default alterna padType to transaction
            if ( ! SafetyUtil.isEmpty(txn.getPadType()) ) {
              alternaFormat.setPadType(txn.getPadType());
            }
            else {
              txn.setPadType(alternaFormat.getPadType());
            }

            //if transaction code is set, write it to csv. otherwise set default alterna code to transaction
            if ( ! SafetyUtil.isEmpty(txn.getTxnCode()) ) {
              alternaFormat.setTxnCode(txn.getTxnCode());
            } else {
              txn.setTxnCode(alternaFormat.getTxnCode());
            }

            alternaFormat.setProcessDate(csvSdf.get().format(generateProcessDate(x, now)));
            alternaFormat.setReference(refNo);

            if ( txn.getProcessDate() == null ) {
              txn.setProcessDate(generateProcessDate(x, now));
            }

            if (txn.getCompletionDate() == null) {
              txn.setCompletionDate(generateCompletionDate(x, now));
            }
          } else if ( t instanceof AlternaCOTransaction ) {
            AlternaCOTransaction txn = (AlternaCOTransaction) t;

            // if transaction padType is set, write it to csv. otherwise set default alterna padType to transaction
            if ( ! SafetyUtil.isEmpty(txn.getPadType()) ) {
              alternaFormat.setPadType(txn.getPadType());
            }
            else {
              txn.setPadType(alternaFormat.getPadType());
            }

            //if transaction code is set, write it to csv. otherwise set default alterna code to transaction
            if ( ! SafetyUtil.isEmpty(txn.getTxnCode()) ) {
              alternaFormat.setTxnCode(txn.getTxnCode());
            } else {
              txn.setTxnCode(alternaFormat.getTxnCode());
            }

            alternaFormat.setProcessDate(csvSdf.get().format(generateProcessDate(x, now)));
            alternaFormat.setReference(refNo);

            if ( txn.getProcessDate() == null ) {
              txn.setProcessDate(generateProcessDate(x, now));
            }

            if (txn.getCompletionDate() == null) {
              txn.setCompletionDate(generateCompletionDate(x, now));
            }
          }

          transactionDAO.put(t);
          out.put(alternaFormat, sub);

          if ( t instanceof AlternaCOTransaction ) {
           AlternaFormat cashout = (AlternaFormat) alternaFormat.fclone();
            cashout.setTxnType("DB");
            out.put(cashout, sub);
          }
          out.flush();
        } catch (Exception e) {
          logger.error("CsvUtil.writeCsvFile", e);
        }
      }
    });
  }
}
