package net.nanopay.tx.bmo;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.bmo.cico.BmoCOTransaction;
import net.nanopay.tx.bmo.cico.BmoTransaction;
import net.nanopay.tx.bmo.cico.BmoVerificationTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class BmoReportProcessor {

  private static final String PATH = System.getProperty("NANOPAY_HOME") + "/var" + "/bmo_eft/";
  private static final String RECEIPT_PROCESSED_FOLDER = PATH + "/processed/receipt/";
  private static final String REPORT_PROCESSED_FOLDER = PATH + "/processed/report/";
  private static final String REPORT_PROCESSED_FAILED_FOLDER = PATH + "/processed/report_failed/";

  private X x;
  private DAO transactionDAO;
  private Logger logger;

  private static Pattern pattern = Pattern.compile("\\d{4}");

  public BmoReportProcessor(X x) {
    this.x         = x;
    logger         = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));
    transactionDAO = (DAO) x.get("localTransactionDAO");
  }

  /**
   * Process the receipt report
   */
  public boolean processReceipt(File file, int fileCreationNumber) {
    if (file == null) {
      return false;
    }

    File receipt = null;

    try {

      String message = FileUtils.readFileToString(file, "US-ASCII");
      boolean result = message.contains("SUCCESSFULLY DELIVERED");
      FileUtils.moveFile(file, new File(RECEIPT_PROCESSED_FOLDER + "_" + fileCreationNumber + "_" +  file.getName()));
      return result;

    } catch (Exception e) {
      this.logger.error("Error when process the receipt file. ", e);
      return false;
    }

  }

  public boolean processReports() {

    Collection<File> files = FileUtils.listFiles(new File(BmoSFTPClient.REPORT_DOWNLOAD_FOLDER), null, false);

    for ( File file : files ) {

      try {

        logger.info("start process report " + file.getName());
        this.processReport(file);
        logger.info("finishing process report " + file.getName());

        FileUtils.moveFile(file, new File(REPORT_PROCESSED_FOLDER + file.getName() + "_" + Instant.now().toEpochMilli()));

      } catch ( Exception e ) {

        try {
          logger.error("Error when process report ", e);
          FileUtils.moveFile(file, new File(REPORT_PROCESSED_FAILED_FOLDER + file.getName() + "_" + Instant.now().toEpochMilli()));
          BmoFormatUtil.sendEmail(x, "BMO EFT error during processing the report", e);
        } catch ( Exception e2 ) {
          logger.error("Error when process report ", e);
        }
      }

    }

    return true;
  }

  public void processReport(File file) throws IOException {

    List<String> strings = FileUtils.readLines(file, "US-ASCII");

    String firstLine = strings.get(0);

    // process rejected file
    if ( firstLine.contains("DEFR210") || firstLine.contains("DEFR211") ) {
      this.processRejectReport(strings);
      return;
    }

    // process settled file
    if ( firstLine.contains("DEFR220") ) {
      processSettlementReport(strings);
      return;
    }

  }

  /**
   * Please see example settlement report: https://drive.google.com/open?id=1TE8aFgren_UL3YWB1VK3QSaDdP8btkzY
   */
  public void processSettlementReport(List<String> report) {

    String fileCreationNumber = "";

    for ( String line : report ) {

      if ( line.contains("FILE CREATION NO.") ) {
        fileCreationNumber = line.substring(25, 29);
      }

      if ( isSettlementRecord(line) ) {
        if ( SafetyUtil.isEmpty(fileCreationNumber) ) {
          throw new RuntimeException("File creation number is empty.");
        }
        processSettlementRecord(line, fileCreationNumber);
      }
    }

  }

  public void processSettlementRecord(String record, String fileCreationNumber ) {

    String referenceNumber = "";

    try {
      referenceNumber = record.substring(55, 74).trim();

      Transaction transaction = getTransactionBy(Integer.valueOf(fileCreationNumber), referenceNumber);

      ((BmoTransaction)transaction).addHistory("Transaction completed.");
      transaction.setCompletionDate(new Date());
      transaction.setStatus(TransactionStatus.COMPLETED);

      transactionDAO.inX(this.x).put(transaction);
    } catch ( Exception e ) {
      logger.error("Error when process reference number: " + referenceNumber, e);
      BmoFormatUtil.sendEmail(x, "Error when process reference number: " + referenceNumber, e);
    }
  }

  public boolean isSettlementRecord(String record) {
    return record.charAt(31) == '-' &&
      StringUtils.isNumeric(record.substring(21, 24) ) &&
      StringUtils.isNumeric(record.substring(27, 31)) &&
      StringUtils.isNumeric(record.substring(32,37)) &&
      StringUtils.isNumeric(record.substring(55, 74).trim());
  }

  /**
   * Please see example rejected report: https://drive.google.com/open?id=1y0BGeLxjhVvS-uKYeG_3bAp6FLzvd46R
   */
  public void processRejectReport(List<String> report) {

    ArrayList<String> rejectedItem = new ArrayList<>();
    String fileCreationNumber = "";

    for ( String line : report ) {

      if ( line.contains("FILE CREATION NO.") ) {
        fileCreationNumber = line.substring(27, 31);
      }

      if ( line.contains("LOG. REC. TYPE") ) {
        // process old reject item
        if ( SafetyUtil.isEmpty(fileCreationNumber) ) {
          throw new RuntimeException("File creation number is empty.");
        }
        processRejectRecord(rejectedItem, fileCreationNumber);

        // creat new reject item
        rejectedItem = new ArrayList<>();
      }

      if ( line.contains("TOTAL REJECTS BY VALUE DATE") ) {
        processRejectRecord(rejectedItem, fileCreationNumber);
      }

      rejectedItem.add(line);
    }

  }

  public void processRejectRecord(ArrayList<String> rejectedItem, String fileCreationNumber) {

    String referenceNumber = "";

    try {
      if ( rejectedItem.size() == 0 ) {
        return;
      }

      if ( ! rejectedItem.get(0).contains("LOG. REC. TYPE") ) {
        return;
      }

      String rejectReason = rejectedItem.subList(5, rejectedItem.size() - 1).stream()
        .filter(line -> !line.trim().equals(""))
        .map(line -> line.substring(28, 73))
        .reduce("", (pre, post) -> pre + post + ";");


      referenceNumber = rejectedItem.get(0).substring(108, 127).trim();

      Transaction transaction = getTransactionBy(Integer.valueOf(fileCreationNumber), referenceNumber);

      transaction.setStatus(TransactionStatus.DECLINED);
      ((BmoTransaction)transaction).addHistory("Transaction rejected.");
      ((BmoTransaction)transaction).setRejectReason(rejectReason);
      transaction.setCompletionDate(new Date());

      transactionDAO.inX(this.x).put(transaction);
    } catch ( Exception e ) {
      logger.error("Error when process reference number: " + referenceNumber, e);
      BmoFormatUtil.sendEmail(x, "Error when process reference number: " + referenceNumber, e);
    }
  }

  public void postProcessReport() {

    Collection<File> files = FileUtils.listFiles(new File(REPORT_PROCESSED_FOLDER), null, false);

    for ( File file : files ) {

      try {

        String fileCreateNumber = this.getFileCreationNumber(file);

        if ( ! SafetyUtil.isEmpty(fileCreateNumber) ) {
          FileUtils.moveFile(file, new File(REPORT_PROCESSED_FOLDER + "/" + fileCreateNumber + "/" + file.getName()));
        }
      } catch ( Exception e ) {
        this.logger.error("Error when post process report, ", e);
      }
    }

  }

  public Transaction getTransactionBy(int fileCreationNumber,  String referenceNumber) {

    Transaction transaction = (Transaction) this.transactionDAO.find(MLang.AND(
      MLang.EQ(BmoCITransaction.BMO_REFERENCE_NUMBER, referenceNumber),
      MLang.EQ(BmoCITransaction.BMO_FILE_CREATION_NUMBER, Integer.valueOf(fileCreationNumber)),
      MLang.EQ(Transaction.STATUS, TransactionStatus.SENT)
    ));

    if ( transaction == null ) {
      transaction = (Transaction) this.transactionDAO.find(MLang.AND(
        MLang.EQ(BmoCOTransaction.BMO_REFERENCE_NUMBER, referenceNumber),
        MLang.EQ(BmoCOTransaction.BMO_FILE_CREATION_NUMBER, Integer.valueOf(fileCreationNumber)),
        MLang.EQ(Transaction.STATUS, TransactionStatus.SENT)
      ));
    }

    if ( transaction == null ) {
      transaction = (Transaction) this.transactionDAO.find(MLang.AND(
        MLang.EQ(BmoVerificationTransaction.BMO_REFERENCE_NUMBER, referenceNumber),
        MLang.EQ(BmoVerificationTransaction.BMO_FILE_CREATION_NUMBER, Integer.valueOf(fileCreationNumber)),
        MLang.EQ(Transaction.STATUS, TransactionStatus.SENT)
      ));
    }

    if ( transaction == null ) {
      throw new RuntimeException("Transaction reference number: " + referenceNumber + " not found");
    }

    return transaction = (Transaction) transaction.fclone();
  }

  public String getFileCreationNumber(File file) throws IOException {

    List<String> strings = FileUtils.readLines(file, "US-ASCII");

    for ( String line : strings ) {
      if ( line.contains("FILE CREATION NO.") ) {
        Matcher matcher = pattern.matcher(line);

        if ( matcher.find() ) {
          return line.substring(matcher.start(), matcher.end());
        }
      }
    }

    return null;
  }
}
