package net.nanopay.tx.rbc;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.nio.file.Files;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import javax.xml.stream.XMLStreamException;

import net.nanopay.iso20022.TransactionGroupStatus3Code;
import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.cico.EFTFileStatus;
import net.nanopay.tx.cico.EFTFileUtil;
import net.nanopay.iso20022.ISO20022Util;
import net.nanopay.iso20022.Pain00200103;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.rbc.exceptions.RbcFTPSException;
import net.nanopay.tx.rbc.ftps.RbcFTPSClient;
import net.nanopay.tx.rbc.RbcPGPUtil;
import net.nanopay.tx.TransactionEvent;

import org.apache.commons.io.FileUtils;


public class RbcReportProcessor {

  private X x;
  private DAO transactionDAO;
  private Logger logger;
  RbcFTPSClient rbcFTPSClient;

  public RbcReportProcessor(X x) {
    this.x          = x;
    logger          = new PrefixLogger(new String[] {this.getClass().getSimpleName(), "RBC"}, (Logger) x.get("logger"));
    transactionDAO  = (DAO) x.get("localTransactionDAO");
    rbcFTPSClient   = new RbcFTPSClient(x);
  }

  /**
   * Process the receipt report
   */
  public void decryptFolder(X x) {
    File folder = new File(RbcFTPSClient.DOWNLOAD_FOLDER);
    for ( File file : folder.listFiles() ) {
      if ( file.isDirectory() ) continue;
      try {
        EFTFileUtil.storeEFTFile(x, file, "text/plain"); // Store file downloaded from RBC
        if ( null != RbcPGPUtil.decrypt(x, file) ) FileUtils.deleteQuietly(file);
      } catch (Exception e) {
        this.logger.error("Error decrypting file: " + file.getName(), e);
        ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
          .setName("RBC File Decryption")
          .setReason(AlarmReason.MANUAL)
          .setNote(e.getMessage())
          .build());
        BmoFormatUtil.sendEmail(x, "RBC error while decrypting file: " + file.getName(), e);
      }
    }
  }

  /**
   * Download specific Level 1(Receipts) EFT files
   */
  public void downloadReceipts(List<EFTFile> files) {
    for ( EFTFile eftFile : files ) {
      try {
        String level1Filter = eftFile.getSpid() + eftFile.getId() + "_A1";
        List<String> nameFilters = Arrays.asList(level1Filter.toUpperCase());
        rbcFTPSClient.batchDownload(RbcFTPSClient.PAIN_FOLDER, nameFilters);
      } catch (Exception e) {
        this.logger.error("Error downloading status receipts from RBC ", e);
      }
    }
  }

  /**
   * Download specific Level 2 & 3(Reports) EFT files
   */
  public void  downloadReports(List<EFTFile> files) {
    for ( EFTFile eftFile : files ) {
      try {
        String level2Filter = eftFile.getSpid() + eftFile.getId() + "_A2";
        String level3Filter = eftFile.getSpid() + eftFile.getId() + "_A3";
        List<String> nameFilters = Arrays.asList(level2Filter.toUpperCase(), level3Filter.toUpperCase());
        rbcFTPSClient.batchDownload(RbcFTPSClient.PAIN_FOLDER, nameFilters);
      } catch (Exception e) {
        this.logger.error("Error downloading status reports from RBC ", e);
      }
    }
  }

  /**
   * Process the report to check file was accepted and valid
   */
  public void processReceipts(List<EFTFile> files) {
    /* Download status report files from RBC */
    downloadReceipts(files);

    /* Decrypt file status report files */
    try{
      decryptFolder(x);
    } catch (Exception e) {
      this.logger.error("Error decrypting files from download folder", e);
    }

    File folder = new File(RbcPGPUtil.DECRYPT_FOLDER);
    for ( File file : folder.listFiles() ) {
      if ( file.isDirectory() ) continue;
      try {
          processReceipt(file);
        } catch(Exception e) {
          logger.error("RBC Error while saving recipt", e);
        }
    }
  }

  /**
   * Process the receipt file
   */
  public void processReceipt(File file) {
    if ( file == null ) return;
    // debugFileContents(file); 

    try {
      ISO20022Util driver = new ISO20022Util();
      Pain00200103 pain = (Pain00200103) driver.fromXML(x, file, Pain00200103.class);
      if ( pain == null || pain.getCstmrPmtStsRpt() == null ) return;
      net.nanopay.iso20022.OriginalGroupInformation20 grpInfo = pain.getCstmrPmtStsRpt().getOriginalGroupInformationAndStatus();
      if ( grpInfo == null || grpInfo.getGroupStatus() == null ) return;

      String fileMessageId = getFileId(pain.getCstmrPmtStsRpt());
      if ( fileMessageId == null ) throw new RuntimeException("Unable to parse File Message ID from PSR file.");
      long fileId = Long.valueOf(fileMessageId.replaceAll("[^0-9]", ""));

      if ( net.nanopay.iso20022.TransactionGroupStatus3Code.ACTC == grpInfo.getGroupStatus() ) {
        updateEFTFile(file, fileId, EFTFileStatus.ACCEPTED);
      } else if ( net.nanopay.iso20022.TransactionGroupStatus3Code.RJCT == grpInfo.getGroupStatus() ) {
        updateEFTFile(file, fileId, EFTFileStatus.REJECTED);
        try {
          processFailedReport(pain.getCstmrPmtStsRpt());
        } catch (Exception e) {
          this.logger.error("Error when processing the updating transaction. ", e);
        }
      }
    } catch (Exception e) {
      this.logger.error("Error when processing the receipt file. ", e);
    }
  }

  protected void updateEFTFile(File file, long fileNumber, EFTFileStatus status) {
    try {
      // Save EFTFile
      foam.nanos.fs.File f = EFTFileUtil.storeEFTFile(this.x, file, fileNumber + "_receipt.txt", "text/plain");
      DAO eftFileDAO = ((DAO) x.get("eftFileDAO")).inX(x);
      EFTFile eftFile = (EFTFile) eftFileDAO.find(fileNumber);
      if ( eftFile != null ) {
        eftFile = (EFTFile) eftFile.fclone();
        eftFile.setReceipt(f.getId());
        if ( status != null ) eftFile.setStatus(status);
        eftFileDAO.put(eftFile);
        FileUtils.deleteQuietly(file);
      }
    } catch ( Exception e ) {
      this.logger.error("Error while saving and updating EFT Receipt File with filecreation number: . " + fileNumber, e.getMessage(), e);
      BmoFormatUtil.sendEmail(x, "Error while saving and updating EFT Receipt File with filecreation number: . " + fileNumber, e);
    }
  }

  /**
   * Process reports from RBC
   */
  public void processReports() throws IOException, XMLStreamException {
    File folder = new File(RbcPGPUtil.DECRYPT_FOLDER);
    for ( File file : folder.listFiles() ) {
      if ( file.isDirectory() ) continue;
      try {
        processReport(file);
      } catch (Exception e) {
        this.logger.error("Error processing report file: " + file.getName(), e);
        BmoFormatUtil.sendEmail(x, "Error processing report file: " + file.getName(), e);
      }
    }
  }

  /**
   * Process single report from RBC
   */
  public void processReport(File file) throws IOException, XMLStreamException {
    ISO20022Util driver = new ISO20022Util();
    Pain00200103 pain = null;
    EFTFileStatus fileStatus = null;
    try {
      pain = (Pain00200103) driver.fromXML(x, file, Pain00200103.class);
      if ( pain == null || pain.getCstmrPmtStsRpt() == null ) return;
      net.nanopay.iso20022.OriginalGroupInformation20 grpInfo = pain.getCstmrPmtStsRpt().getOriginalGroupInformationAndStatus();
      if ( grpInfo == null  || null == grpInfo.getGroupStatus()) return;

      // Do nothing if it is a receipt. Receipt cron already handles this
      if ( net.nanopay.iso20022.TransactionGroupStatus3Code.ACTC == grpInfo.getGroupStatus() ) return;

      if ( net.nanopay.iso20022.TransactionGroupStatus3Code.RJCT == grpInfo.getGroupStatus() ) {
        fileStatus = EFTFileStatus.REJECTED;
        processFailedReport(pain.getCstmrPmtStsRpt());
      } else if ( TransactionGroupStatus3Code.ACSP == grpInfo.getGroupStatus() ) {
        fileStatus = EFTFileStatus.PROCESSED;
        processPaymentReport(pain.getCstmrPmtStsRpt());
      }

      // Store report file processed
      String fileMessageId = getFileId(pain.getCstmrPmtStsRpt());
      if ( fileMessageId == null ) throw new RuntimeException("Unable to parse File Message ID from PSR file.");
      long fileId = Long.valueOf(fileMessageId.replaceAll("[^0-9]", ""));
      updateEFTFile(file, fileId, fileStatus);
    } catch (Exception e) {
      this.logger.error("Error when processing the report file. ", e);
      throw e;
    }
  }

  /**
   * Process failed reports
   */
  protected void processFailedReport(net.nanopay.iso20022.CustomerPaymentStatusReportV03 cstmrPmtStsRpt) throws RuntimeException  {
    try {
      if ( cstmrPmtStsRpt == null || null == cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus()
        || null == cstmrPmtStsRpt.getOriginalGroupInformationAndStatus() ) return;

      String fileMessageId = getFileId(cstmrPmtStsRpt);
      if ( fileMessageId == null ) throw new RuntimeException("Unable to parse File Message ID from PSR file.");
      long fileId = Long.valueOf(fileMessageId.replaceAll("[^0-9]", ""));
      for( net.nanopay.iso20022.OriginalPaymentInformation1 paymentInfo : cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus() ) {
        processFailedPayment(paymentInfo, fileId);
      }
    } catch (Exception e) {
      this.logger.error("Error when processing failed report ", e);
      throw e;
    }
  }

  /**
   * Process failed payment
   */
  protected void processFailedPayment(net.nanopay.iso20022.OriginalPaymentInformation1 paymentInfo, long messageId) {
    if ( null == paymentInfo || null == paymentInfo.getTransactionInformationAndStatus() ) return;

    for ( net.nanopay.iso20022.PaymentTransactionInformation25 txnInfoStatus : paymentInfo.getTransactionInformationAndStatus() ) {
      try {
        String rejectReason = getRejectReason(txnInfoStatus.getStatusReasonInformation());
        Transaction transaction = getTransaction(messageId, txnInfoStatus.getOriginalEndToEndIdentification());
        if ( TransactionStatus.COMPLETED == transaction.getStatus() ) {
          String msg = "RBC received DECLINE on COMPLETED transaction: " + transaction.getId();
          BmoFormatUtil.sendEmail(x, msg, null);
          Notification notification = new Notification.Builder(x)
            .setTemplate("NOC")
            .setBody(msg)
            .build();
          ((DAO) x.get("localNotificationDAO")).put(notification);
          return; // Don't decline already Completed transactions
        }
        transaction.setStatus(TransactionStatus.DECLINED);
        transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Transaction rejected. " + rejectReason).build());
        ((RbcTransaction)transaction).setRejectReason(rejectReason);
        transaction.setCompletionDate(new Date());

        transactionDAO.inX(this.x).put(transaction);

      } catch (Exception e) {
        this.logger.error("Error when parsing failed report for transaction reference number " + txnInfoStatus.getOriginalEndToEndIdentification(), e);
        BmoFormatUtil.sendEmail(x, "Error when process report for payment with reference number: " + txnInfoStatus.getOriginalEndToEndIdentification(), e);
      }
    }
  }

  protected void processPaymentReport(net.nanopay.iso20022.CustomerPaymentStatusReportV03 cstmrPmtStsRpt) throws RuntimeException  {
    try {
      if ( cstmrPmtStsRpt == null || null == cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus()
        || null == cstmrPmtStsRpt.getOriginalGroupInformationAndStatus() ) return;

      String fileMessageId = getFileId(cstmrPmtStsRpt);
      if ( fileMessageId == null ) throw new RuntimeException("Unable to parse File Message ID from PSR file.");
      long fileId = Long.valueOf(fileMessageId.replaceAll("[^0-9]", ""));
      for ( net.nanopay.iso20022.OriginalPaymentInformation1 paymentInfo : cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus() ) {
        processPaymentStatus(paymentInfo, fileId);
      }
    } catch (Exception e) {
      this.logger.error("Error when processing failed report ", e);
      throw e;
    }
  }

  /**
   * Process payment status
   */
  protected void processPaymentStatus(net.nanopay.iso20022.OriginalPaymentInformation1 paymentInfo, long messageId) {
    if ( null == paymentInfo || null == paymentInfo.getTransactionInformationAndStatus() ) return;

    for ( net.nanopay.iso20022.PaymentTransactionInformation25 txnInfoStatus : paymentInfo.getTransactionInformationAndStatus() ) {
      if ( net.nanopay.iso20022.TransactionIndividualStatus3Code.ACSP != txnInfoStatus.getTransactionStatus() ) continue;
      try {
        Transaction transaction = getTransaction(messageId, txnInfoStatus.getOriginalEndToEndIdentification());
        transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Transaction was settled by RBC.").build());
        ((RbcTransaction)transaction).setSettled(true);

        transactionDAO.inX(this.x).put(transaction);

      } catch (Exception e) {
        this.logger.error("Error when parsing failed report for transaction reference number " + txnInfoStatus.getOriginalEndToEndIdentification(), e);
        BmoFormatUtil.sendEmail(x, "Error when process report for payment with reference number: " + txnInfoStatus.getOriginalEndToEndIdentification(), e);
      }
    }
  }

  public Transaction getTransaction(long fileId,  String referenceNumber) throws RuntimeException {

    Transaction transaction = (Transaction) this.transactionDAO.find(MLang.AND(
      MLang.EQ(RbcCITransaction.RBC_REFERENCE_NUMBER, referenceNumber),
      MLang.EQ(RbcCITransaction.RBC_FILE_CREATION_NUMBER, fileId)
    ));

    if ( transaction == null ) {
      transaction = (Transaction) this.transactionDAO.find(MLang.AND(
        MLang.EQ(RbcCOTransaction.RBC_REFERENCE_NUMBER, referenceNumber),
        MLang.EQ(RbcCOTransaction.RBC_FILE_CREATION_NUMBER, fileId)
      ));
    }

    if ( transaction == null ) {
      transaction = (Transaction) this.transactionDAO.find(MLang.AND(
        MLang.EQ(RbcVerificationTransaction.RBC_REFERENCE_NUMBER, referenceNumber),
        MLang.EQ(RbcVerificationTransaction.RBC_FILE_CREATION_NUMBER, fileId)
      ));
    }

    if ( transaction == null ) {
      throw new RuntimeException("Transaction reference number: " + referenceNumber + " not found");
    }

    return transaction = (Transaction) transaction.fclone();
  }

  protected String getRejectReason(net.nanopay.iso20022.StatusReasonInformation8 reasonInfos[]) {
    if ( null == reasonInfos ) return "";
    StringBuilder str = new StringBuilder();

    for ( net.nanopay.iso20022.StatusReasonInformation8 reason : reasonInfos ) {
      if ( null == reason.getReason() ) continue;
      String code = SafetyUtil.isEmpty(reason.getReason().getCd()) ? reason.getReason().getPrtry() : reason.getReason().getCd();
      str.append(code);
      str.append(" : ");
      if ( null != reason.getAdditionalInformation() ) {
        for ( String additionalInfo : reason.getAdditionalInformation() ) {
          str.append(additionalInfo);
          str.append(" ");
        }
      }
    }
    return str.toString();
  }

  protected String getFileId(net.nanopay.iso20022.CustomerPaymentStatusReportV03 cstmrPmtStsRpt) {
    if ( cstmrPmtStsRpt == null || null == cstmrPmtStsRpt.getOriginalPaymentInformationAndStatus()
        || null == cstmrPmtStsRpt.getOriginalGroupInformationAndStatus() ) return null;

    return cstmrPmtStsRpt.getOriginalGroupInformationAndStatus().getOriginalMessageIdentification();
  }

  protected void debugFileContents(File file) {
    if ( file == null || file.length() == 0 ) return;

    try {
      char[] buffer = new char[(int)file.length()];
      int read = new FileReader(file).read(buffer, 0, (int)file.length());
      if ( read > 0 ) {
        String contents = new StringBuilder().append(buffer).toString();
        this.logger.debug(contents);
      }
    } catch (Exception ex) {
      this.logger.error("Error writing debug message for file", file, ex);
    }
  }
}
