package net.nanopay.tx.bmo;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.bmo.cico.BmoCOTransaction;
import net.nanopay.tx.bmo.cico.BmoTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class BmoReportProcessor {

  private static final String PATH = System.getProperty("JOURNAL_HOME") + "/bmo_eft/";
  private static final String RECEIPT_PROCESSED_FOLDER = PATH + "/processed/receipt/";
  private static final String REPORT_PROCESSED_FOLDER = PATH + "/processed/report/";

  private X x;
  private DAO transactionDAO;
  private Logger logger;

  public BmoReportProcessor(X x) {
    this.x = x;
    transactionDAO = (DAO) x.get("localTransactionDAO");
    logger = (Logger) x.get("logger");
  }

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
      e.printStackTrace();
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
        logger.error("Error when process report ", e);
      }
    }

    return true;
  }

  public void processReport(File file) throws IOException {

    List<String> strings = FileUtils.readLines(file, "US-ASCII");

    String firstLine = strings.get(0);

    if ( firstLine.contains("DEFR210") || firstLine.contains("DEFR211") ) {
      // process rejected file
      this.processRejectReport(strings);

      return;
    }

    if ( firstLine.contains("DEFR220") ) {
      // process settled file
      processSettlementReport(strings);
      return;
    }

  }

  public void processSettlementReport(List<String> report) {

    String fileCreationNumber = "";

    for ( String line : report ) {

      if ( line.contains("FILE CREATION NO.") ) {
        fileCreationNumber = line.substring(25, 29);
      }

      if ( isSettlementRecord(line) ) {
        processSettlementRecord(line, fileCreationNumber);
      }
    }

  }

  public void processSettlementRecord(String record, String fileCreationNumber ) {

    String referenceNumber = record.substring(55, 74).trim();

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
      return;
    }

    transaction = (Transaction) transaction.fclone();

    ((BmoTransaction)transaction).addHistory("Transaction completed.");
    ((BmoTransaction)transaction).setCompletedTimeEDT(BmoFormatUtil.getCurrentDateTimeEDT());
    transaction.setStatus(TransactionStatus.COMPLETED);

    transactionDAO.inX(this.x).put(transaction);
  }

  public boolean isSettlementRecord(String record) {
    return StringUtils.isNumeric(record.substring(21, 24) ) &&
      StringUtils.isNumeric(record.substring(27, 31)) &&
      record.charAt(31) == '-' &&
      StringUtils.isNumeric(record.substring(32,37)) &&
      StringUtils.isNumeric(record.substring(55, 74).trim());
  }

  public void processRejectReport(List<String> report) {

    ArrayList<String> rejectedItem = new ArrayList<>();
    String fileCreationNumber = "";

    for ( String line : report ) {

      if ( line.contains("FILE CREATION NO.") ) {
        fileCreationNumber = line.substring(27, 31);
      }

      if ( line.contains("LOG. REC. TYPE") ) {
        // process old reject item
        processRejectRecord(rejectedItem, fileCreationNumber);

        // creat new reject item
        rejectedItem = new ArrayList<>();
      }

      if ( line.contains("TOTAL REJECTS BY VALUE DATE") ) {
        processRejectRecord(rejectedItem, fileCreationNumber);
        return;
      }

      rejectedItem.add(line);
    }

  }

  public void processRejectRecord(ArrayList<String> rejectedItem, String fileCreationNumber) {

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


    String referenceNumber = rejectedItem.get(0).substring(108, 127).trim();

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
      return;
    }

    transaction = (Transaction) transaction.fclone();

    transaction.setStatus(TransactionStatus.DECLINED);
    ((BmoTransaction)transaction).addHistory("Transaction rejected.");
    ((BmoTransaction)transaction).setRejectReason(rejectReason);

    transactionDAO.inX(this.x).put(transaction);
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

  public String getFileCreationNumber(File file) throws IOException {

    List<String> strings = FileUtils.readLines(file, "US-ASCII");

    for ( String line : strings ) {
      if ( line.contains("FILE CREATION NO.") ) {
        Pattern pattern = Pattern.compile("\\d{4}");
        Matcher matcher = pattern.matcher(line);

        if ( matcher.find() ) {
          return line.substring(matcher.start(), matcher.end());
        }
      }
    }

    return null;
  }
}
