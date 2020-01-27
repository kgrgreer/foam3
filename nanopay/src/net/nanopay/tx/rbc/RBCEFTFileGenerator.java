package net.nanopay.tx.rbc;

import foam.core.Currency;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;

import java.math.BigDecimal;
import java.io.File;
import java.io.IOException;
import java.security.NoSuchProviderException;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import net.nanopay.iso20022.Pain00100103;
import net.nanopay.iso20022.Pain00800102;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.rbc.exceptions.RbcFTPSException;
import net.nanopay.tx.rbc.exceptions.RbcIsoFileException;
import net.nanopay.tx.rbc.ftps.RbcFTPSCredential;
import net.nanopay.tx.rbc.iso20022file.RbcBatchRecord;
import net.nanopay.tx.rbc.iso20022file.RbcBatchControl;
import net.nanopay.tx.rbc.iso20022file.RbcCIRecord;
import net.nanopay.tx.rbc.iso20022file.RbcCORecord;
import net.nanopay.tx.rbc.iso20022file.RbcISO20022File;
import net.nanopay.tx.rbc.iso20022file.RbcTransmissionHeader;
import net.nanopay.tx.TransactionEvent;
import org.apache.commons.io.FileUtils;

public class RBCEFTFileGenerator {

  X                   x;
  DAO                 currencyDAO;
  DAO                 rbcISOFileDAO;
  Logger              logger;
  RbcFTPSCredential   rbcCredential;

  public static final String SEND_FOLDER = System.getProperty("NANOPAY_HOME") + "/var" + "/rbc_aft/send/";
  public static final String SEND_FAILED = System.getProperty("NANOPAY_HOME") + "/var" + "/rbc_aft/send_failed/";

  public RBCEFTFileGenerator(X x) {
    this.x = x;
    this.currencyDAO    = (DAO) x.get("currencyDAO");
    this.rbcISOFileDAO  = (DAO) x.get("rbcISOFileDAO");
    this.rbcCredential  = (RbcFTPSCredential) x.get("rbcFTPSCredential");
    this.logger         = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
  }

  /**
   * Create the real file objects and save it into the disk.
   * @param batch the RbcBatchRecord Object created from initFile method
   * @return list of real file object
   */
  public File createFile(RbcISO20022File isoFile) {
    File file = null;
    if ( isoFile != null ) {
      try {
        file = new File(SEND_FOLDER + isoFile.getFileName() + "_" + Instant.now().toEpochMilli());
        FileUtils.touch(file);
        FileUtils.writeStringToFile(file, isoFile.getContent(), false);
      } catch (IOException e) {
        this.logger.error("Error when create rbc iso20022 file with name - " + isoFile.getFileName(), e);
        throw new RbcFTPSException("Error when create rbc iso20022 file with name - " + isoFile.getFileName(), e);
      }
    }

    return file;
  }

  /**
   * Create the encrypted file.
   * @param plainFiles real plain files 
   * @return list of encrypted file objects
   */
  public File createEncryptedFile(File plainFile) {
    File encFile = null;
    if ( plainFile != null ) {
      try {
        encFile = RbcPGPUtil.encrypt(this.x , plainFile);
      } catch (Exception e) {
        this.logger.error("Error when create rbc encrypted file with name - " + plainFile.getName(), e);
        throw new RbcFTPSException("Error when create rbc encrypted file with name - " + plainFile.getName(), e);
      }
    }

    return encFile;
  }

  /**
   * Convert the transaction into the RbcISO20022File
   * @param transactions
   * @return
   */
  public RbcBatchRecord createBatch(List<Transaction> transactions) {
    RbcTransmissionHeader         transmissionHeader      = null;
    RbcBatchRecord                batch                   = new RbcBatchRecord();
    RbcBatchControl               batchControl            = new RbcBatchControl();
    RBCTransactionISO20022Util    transactionISO20022Util = new RBCTransactionISO20022Util();
    int coCount = 0; long coAmount = 0;
    int ciCount = 0; long ciAmount = 0;

    try {
      // file transmission header
      transmissionHeader = transmissionHeader(rbcCredential);

      // // create Pain00800102 for CITransaction
      List<Transaction> ciTransactions = transactions.stream()
        .filter(transaction -> transaction instanceof CITransaction)
        .collect(Collectors.toList());

        // Initial put to dao to get unique id
      RbcISO20022File ciFile = new RbcISO20022File();
      ciFile = (RbcISO20022File) rbcISOFileDAO.inX(x).put(ciFile);      
      try{
        RbcCIRecord ciRecords = transactionISO20022Util.generateCIRecords(x, ciTransactions.toArray(new Transaction[ciTransactions.size()]), String.valueOf(ciFile.getId()));
        if( ciRecords != null && ciRecords.getDebitMsg() != null ){
          ciRecords.setTransmissionHeader(transmissionHeader);
          ciFile.setFileName(ciFile.getId() + "-debit-" + ".txt");
          String content = ciRecords.toPain00800102XML();          
          content = replaceInbetweenTag(content, "<ReqdColltnDt>", "</ReqdColltnDt>"); // TODO an Ugly hack pending when ISODate outputter is fixed
          content = replaceInbetweenTag(content, "<RltdDt>", "</RltdDt>");
          ciFile.setContent(content);
          ciFile.setFileCreationTimeEDT(getCurrentDateTimeEDT());
          ciRecords.setFile(ciFile);
          batch.setCiRecords(ciRecords);
          ciCount = Integer.parseInt(ciRecords.getDebitMsg().getCstmrDrctDbtInitn().getGroupHeader().getNumberOfTransactions());
          ciAmount = fromDecimal(ciRecords.getDebitMsg().getCstmrDrctDbtInitn().getGroupHeader().getControlSum());
          rbcISOFileDAO.inX(x).put(ciFile);
        } else {
          rbcISOFileDAO.inX(x).remove(ciFile);
        }
      } catch ( Exception e ) {
        this.logger.error("Error creating RBC ISO20022 file", e); // TODO: Notification
      }

      // // create Pain00100103 for COTransaction
      List<Transaction> coTransactions = transactions.stream()
        .filter(transaction -> (transaction instanceof COTransaction || transaction instanceof RbcVerificationTransaction))
        .collect(Collectors.toList());
      
      // Initial put to dao to get unique id
      RbcISO20022File coFile = new RbcISO20022File();
      coFile = (RbcISO20022File) rbcISOFileDAO.inX(x).put(coFile);
      try{
        RbcCORecord coRecords = transactionISO20022Util.generateCORecords(x, coTransactions.toArray(new Transaction[coTransactions.size()]), String.valueOf(coFile.getId()));
        if( coRecords != null && coRecords.getCreditMsg() != null ){
          coRecords.setTransmissionHeader(transmissionHeader);
          coFile.setFileName(coFile.getId() + "-credit-" + ".txt");
          String content = coRecords.toPain00100103XML();          
          content = replaceInbetweenTag(content, "<ReqdExctnDt>", "</ReqdExctnDt>"); // TODO an Ugle hack pending when ISODate outputter is fixed
          content = replaceInbetweenTag(content, "<RltdDt>", "</RltdDt>");
          coFile.setContent(content);
          coFile.setFileCreationTimeEDT (getCurrentDateTimeEDT());
          coRecords.setFile(coFile);
          batch.setCoRecords(coRecords);
          coCount = Integer.parseInt(coRecords.getCreditMsg().getCstmrCdtTrfInitn().getGroupHeader().getNumberOfTransactions());
          coAmount = fromDecimal(coRecords.getCreditMsg().getCstmrCdtTrfInitn().getGroupHeader().getControlSum());
          rbcISOFileDAO.inX(x).put(coFile);
        } else{
          rbcISOFileDAO.inX(x).remove(coFile);
        }
      } catch ( Exception e ) {
        this.logger.error("Error creating RBC ISO20022 file", e); // TODO: Notification
      }

      // batch control
      batchControl.setTotalNumberOfD (ciCount);
      batchControl.setTotalValueOfD  (ciAmount);
      batchControl.setTotalNumberOfC (coCount);
      batchControl.setTotalValueOfC  (coAmount);
      batch.setBatchControl(batchControl);
      batch.setBatchCreationTimeEDT(getCurrentDateTimeEDT());

    } catch ( Exception e ) {
      // if any exception occurs here, no transaction will be sent out
      this.logger.error("Error when init rbc ISO20022 file");
      throw new RbcIsoFileException("Error when init rbc ISO20022 file", e);
    }

    return batch;
  }

  /**
   * Create RBC file transmission header
   */
  public RbcTransmissionHeader transmissionHeader(RbcFTPSCredential creds) {

    RbcTransmissionHeader header = new RbcTransmissionHeader();
    header.setNetworkGateway(creds.getNetworkGatewayId());
    header.setNetworkGatewayClientId(creds.getNetworkGatewayClientId());

    return header;
  }

  public static String getCurrentDateTimeEDT() {
    ZonedDateTime est = ZonedDateTime.now(ZoneId.of("America/Toronto"));
    return est.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
  }

  private Long fromDecimal(Double amount) {
    BigDecimal x100 = new BigDecimal(100);
    BigDecimal val = BigDecimal.valueOf(amount).setScale(2,BigDecimal.ROUND_HALF_DOWN);
    return val.multiply(x100).longValueExact();
  }

  private String replaceInbetweenTag(String str, String starttag, String endtag) {
    String pattern = starttag + "(.*?)" + endtag;
    StringBuffer sb = new StringBuffer();
    Pattern p = Pattern.compile(pattern,Pattern.DOTALL);
    Matcher m = p.matcher(str);

    while(m.find()){
      String valueFromTags = m.group(1);
      m.appendReplacement(sb, starttag + valueFromTags.substring(0, Math.min(valueFromTags.length(), 10)) + endtag);
    }
    m.appendTail(sb);
    String result = sb.toString();
    System.out.println(result);
    return result;
  }

}
