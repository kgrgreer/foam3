package net.nanopay.tx.bmo;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.bmo.cico.BmoCOTransaction;
import net.nanopay.tx.bmo.cico.BmoTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class BmoReportProcessor {

  private static final String PATH = System.getProperty("JOURNAL_HOME") + "/bmo_eft/";
  private static final String RECEIPT_PROCESSED_FOLDER = PATH + "/processed/receipt/";
  private static final String REPORT_PROCESSED_FOLDER = PATH + "/processed/report/";

  private X x;
  private DAO transactionDAO;

  public BmoReportProcessor(X x) {
    this.x = x;
    transactionDAO = (DAO) x.get("localTransactionDAO");
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

    try {
      Collection<File> files = FileUtils.listFiles(new File(BmoSFTPClient.REPORT_DOWNLOAD_FOLDER), null, false);

      for ( File file : files ) {
        this.processReport(file);
        FileUtils.moveFile(file, new File(REPORT_PROCESSED_FOLDER + file.getName() + "_" + Instant.now().toEpochMilli()));
      }
    } catch ( Exception e ) {

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

      return;
    }

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

    transaction = (Transaction) transaction.fclone();

    transaction.setStatus(TransactionStatus.DECLINED);
    ((BmoTransaction)transaction).setRejectReason(rejectReason);

    transactionDAO.inX(this.x).put(transaction);
  }

  /**
   *
   * Comment out below for now, once I get the right report format, will remove or modify it.
   *
   */

//  public void processReportFile(File file) {
//
//    try {
//      List<String> strings = FileUtils.readLines(file, "US-ASCII");
//
//      if ( strings.get(0).startsWith("A") && BmoFormatUtil.fieldAt(strings.get(0), 68, 48).equals("STL") ) {
//        // process settlement file 220
//
//
//        return;
//      }
//
//      if ( strings.get(0).startsWith("A") ) {
//        // process rejects 210/211
//
//        return;
//      }
//
//
//    } catch (IOException e) {
//      e.printStackTrace();
//    }
//
//  }
//
//  public void process210And211(List<String> strings) {
//
//    for (String s : strings) {
//      if ( s.startsWith("C") || s.startsWith("I") || s.startsWith("D") || s.startsWith("J") ) {
//
//      }
//    }
//  }
//
//  public void process210And211Detail(String record) {
//    String repeatSegments = BmoFormatUtil.fieldAt(record, 25, 1464);
//    List<String> segments = BmoFormatUtil.splitRecord(repeatSegments);
//
//    for ( String segment : segments ) {
//      String referenceNumber = BmoFormatUtil.fieldAt(segment, 175, 193);
//      String rejectType = BmoFormatUtil.fieldAt(segment, 25, 27);
//
//      Transaction transaction = getTransactionBy(referenceNumber);
//      transaction.setStatus(TransactionStatus.DECLINED);
//      ((BmoTransaction)transaction).setRejectType(rejectType);
//
//      this.transactionDAO.inX(x).put(transaction);
//    }
//  }
//
//  public Transaction getTransactionBy(String referenceNumber) {
//
//    Predicate condition1 = MLang.OR(
//      MLang.INSTANCE_OF(BmoCITransaction.class),
//      MLang.INSTANCE_OF(BmoCITransaction.class)
//    );
//
//    Predicate condition2 = MLang.OR(
//      MLang.EQ(BmoCITransaction.BMO_REFERENCE_NUMBER, referenceNumber),
//      MLang.EQ(BmoCOTransaction.BMO_REFERENCE_NUMBER, referenceNumber)
//    );
//
//    Predicate condition3 = MLang.EQ(Transaction.STATUS, TransactionStatus.SENT);
//
//    Transaction transaction = (Transaction) transactionDAO.inX(this.x).find(MLang.AND(
//      condition1,
//      condition2,
//      condition3
//    ));
//
//    return (Transaction) transaction.fclone();
//  }

}
