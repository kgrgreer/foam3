package net.nanopay.tx.alterna;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.lib.csv.CSVOutputterImpl;
import foam.dao.CSVSink;
import foam.dao.DAO;
import foam.lib.json.OutputterMode;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.model.Branch;
import net.nanopay.payment.Institution;
import net.nanopay.payment.PADType;
import net.nanopay.payment.PADTypeLineItem;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.io.PrintWriter;
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

  // 2019 bank holidays for Canada
  public final static List<Integer> cadHolidays = Arrays.asList(1, 49, 109, 140, 182, 217, 245, 287, 315, 359, 360);

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
  public static String generateFilename(Date date, String identifier) {
    return filenameSdf.get().format(date) + "_" + identifier + ".csv";
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
  public static void writeCsvFile(X x, PrintWriter o, OutputterMode mode) {
    final Date now            = new Date();
    final DAO bankAccountDAO  = (DAO) x.get("localAccountDAO");
    final DAO transactionDAO  = (DAO) x.get("localTransactionDAO");
    final DAO userDAO         = (DAO) x.get("localUserDAO");
    final DAO institutionDAO  = (DAO) x.get("institutionDAO");
    final DAO branchDAO       = (DAO) x.get("branchDAO");
    final DAO notificationDAO = (DAO) x.get("localNotificationDAO");
    Logger logger = (Logger) x.get("logger");

    CSVSink out = new CSVSink.Builder(x)
      .setOutputter(new CSVOutputterImpl.Builder(x)
        .setIsFirstRow(false)
        .setOf((new net.nanopay.tx.alterna.AlternaFormat()).getClassInfo())
        .build()
      ).build();
    transactionDAO
      .where(
             AND(
                 EQ(Transaction.STATUS, TransactionStatus.PENDING),
                 OR(
                    INSTANCE_OF(AlternaCITransaction.class),
                    INSTANCE_OF(AlternaCOTransaction.class),
                    INSTANCE_OF(AlternaVerificationTransaction.class)
                    )
                 )
             )
      .select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        Logger logger = (Logger) x.get("logger");
        try {
          User user;
          String txnType;
          String refNo;
          BankAccount bankAccount = null;
          Transaction t = (Transaction) ((Transaction) obj).fclone();

          if ( t instanceof AlternaCOTransaction || t instanceof AlternaVerificationTransaction ) {
            txnType = "CR";
            bankAccount = (BankAccount) t.findDestinationAccount(x);

            if ( bankAccount == null ) {
              // NOTE: reporting here as this is one of the few places after
              // Transaction creation that we process for BankAccount
              // Institution and Branch.
              StringBuilder message = new StringBuilder();
              message.append("BankAccount not found.");
              message.append(" Transaction: "+t.getId());
              message.append(" Account: " +t.getDestinationAccount());

              logger.error(message.toString());
              Notification notification = new Notification.Builder(x)
                .setTemplate("NOC")
                .setBody(message.toString())
                .build();
              notificationDAO.put(notification);
              return;
            }
          } else {
            txnType = "DB";
            bankAccount = (BankAccount) t.findSourceAccount(x);

            if ( bankAccount == null ) {
              StringBuilder message = new StringBuilder();
              message.append("BankAccount not found.");
              message.append(" Transaction: "+t.getId());
              message.append(" Account: " +t.getSourceAccount());

              logger.error(message.toString());
              Notification notification = new Notification.Builder(x)
                .setTemplate("NOC")
                .setBody(message.toString())
                .build();
              notificationDAO.put(notification);
              return;
            }
          }

          user = (User) userDAO.find_(x, bankAccount.getOwner());
          if ( user == null ) {
            StringBuilder message = new StringBuilder();
              message.append("BankAccount owner not found.");
              message.append(" Transaction: "+t.getId());
              message.append(" Account: " +t.getSourceAccount());

              logger.error(message.toString());
              Notification notification = new Notification.Builder(x)
                .setTemplate("NOC")
                .setBody(message.toString())
                .build();
              notificationDAO.put(notification);
              return;
          }

          Branch branch = bankAccount.findBranch(x);
          if ( branch == null ) {
            StringBuilder message = new StringBuilder();
            message.append("Branch not found.");
            message.append(" Transaction: "+t.getId());
            message.append(" Account: " +bankAccount.getId());
            message.append(" Branch ID: " +bankAccount.getBranch());

            logger.error(message.toString());
            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setBody(message.toString())
              .build();
            notificationDAO.put(notification);
            return;
          }

          Institution institution = (Institution) branch.findInstitution(x);
          if ( institution == null ) {
            logger.error("Institution not found. id:", bankAccount.getInstitution(), "for account", bankAccount);
            StringBuilder message = new StringBuilder();
            message.append("Institution not found.");
            message.append(" Transaction: "+t.getId());
            message.append(" Account: " +bankAccount.getId());
            message.append(" Branch ID: " +branch.getId());
            message.append(" Institution ID: " +branch.getInstitution());

            logger.error(message.toString());
            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setBody(message.toString())
              .build();
            notificationDAO.put(notification);
            return;
          }
          // use transaction ID as the reference number
          refNo = String.valueOf(t.getId());

          boolean isOrganization = (user.getOrganization() != null && !user.getOrganization().isEmpty());
          AlternaFormat alternaFormat = new AlternaFormat();

          alternaFormat.setFirstName( removeComma(!isOrganization ? user.getFirstName() : user.getOrganization()) );
          alternaFormat.setLastName(  removeComma(!isOrganization ? user.getLastName() : "") );
          // Question: Only branchId is used? Is the institution number not needed for alterna?
          alternaFormat.setTransitNumber(padLeftWithZeros(String.valueOf(( branch.getBranchId() )), 5));
          alternaFormat.setBankNumber(padLeftWithZeros(String.valueOf((    institution.getInstitutionNumber() )), 3));
          alternaFormat.setAccountNumber(bankAccount.getAccountNumber());
          alternaFormat.setAmountDollar(String.format("$%.2f", (t.getAmount() / 100.0)));
          alternaFormat.setTxnType(txnType);

          // Unfortunately have to duplicate for each of CI and CO
          if ( t instanceof AlternaCITransaction ) {
            AlternaCITransaction txn = (AlternaCITransaction) t;

            // if transaction padType is set, write it to csv. Otherwise set padType based on if it has organization
            if ( ! SafetyUtil.isEmpty(txn.getPadType()) ) {
              alternaFormat.setPadType(txn.getPadType());
            } else {
              alternaFormat.setPadType(isOrganization ? "Business" : "Personal");
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
          } else if ( t instanceof AlternaCOTransaction ) {
            AlternaCOTransaction txn = (AlternaCOTransaction) t;

            // if transaction padType is set, write it to csv. Otherwise set padType based on if it has organization
            if ( ! SafetyUtil.isEmpty(txn.getPadType()) ) {
              alternaFormat.setPadType(txn.getPadType());
            } else {
              alternaFormat.setPadType(isOrganization ? "Business" : "Personal");
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
          } else if ( t instanceof AlternaVerificationTransaction ) {
            AlternaVerificationTransaction txn = (AlternaVerificationTransaction) t;

            // if transaction padType is set, write it to csv. Otherwise set padType based on if it has organization
            if ( ! SafetyUtil.isEmpty(txn.getPadType()) ) {
              alternaFormat.setPadType(txn.getPadType());
            } else {
              alternaFormat.setPadType(isOrganization ? "Business" : "Personal");
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

            // QUESTION: do we want to apply the clearing time rules to alterna
            // verification transactions?
            if (txn.getCompletionDate() == null) {
              txn.setCompletionDate(generateCompletionDate(x, now));
            }
          }

          alternaFormat.setTxnCode(getPADTypeCode(x, t));
          transactionDAO.put(t);
          out.put(alternaFormat, sub);

          // if a verification transaction, also add a DB with same information
          if ( t instanceof AlternaVerificationTransaction ) {
            AlternaFormat cashout = (AlternaFormat) alternaFormat.fclone();
            cashout.setTxnType("DB");
            out.put(cashout, sub);
          }

        } catch (Exception e) {
          logger.error("CsvUtil.writeCsvFile", e);
        }
      }
    });

    out.eof();
    if ( o instanceof PrintWriter ) {
      o.write(out.getCsv());
      o.flush();
    }
  }

  public static String removeComma(String str) {
    return str.replace("," , " ");
  }

  public static String getPADTypeCode(X x, Transaction transaction) {

    PADType padType = PADTypeLineItem.getPADTypeFrom(x, transaction);

    if ( padType != null && padType.getId() != 700 ) {
      return String.valueOf(padType.getId());
    }

    // we need to map 700 to 729 for Alterna EFT
    return "729";
  }
}
