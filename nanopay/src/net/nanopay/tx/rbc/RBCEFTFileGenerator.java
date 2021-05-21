package net.nanopay.tx.rbc;

import foam.core.Currency;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.notification.Notification;

import java.math.BigDecimal;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.io.IOException;
import java.security.NoSuchProviderException;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import net.nanopay.iso20022.Pain00100103;
import net.nanopay.iso20022.Pain00800102;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.cico.EFTFileGenerator;
import net.nanopay.tx.cico.EFTFileStatus;
import net.nanopay.tx.cico.EFTFileUtil;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.rbc.exceptions.RbcFTPSException;
import net.nanopay.tx.rbc.exceptions.RbcEftFileException;
import net.nanopay.tx.rbc.ftps.RbcFTPSCredential;
import net.nanopay.tx.rbc.iso20022file.RbcBatchRecord;
import net.nanopay.tx.rbc.iso20022file.RbcBatchControl;
import net.nanopay.tx.rbc.iso20022file.RbcCIRecord;
import net.nanopay.tx.rbc.iso20022file.RbcCORecord;
import net.nanopay.tx.rbc.iso20022file.RbcTransmissionHeader;
import net.nanopay.tx.TransactionEvent;
import org.apache.commons.io.FileUtils;

public class RBCEFTFileGenerator implements EFTFileGenerator {

  X                   x;
  DAO                 eftFileDAO;
  Logger              logger;
  RbcFTPSCredential   rbcCredential;
  private ArrayList<Transaction> passedTransactions = new ArrayList<>();

  public RBCEFTFileGenerator(X x) {
    this.x = x;
    this.eftFileDAO  = (DAO) x.get("eftFileDAO");
    this.rbcCredential  = (RbcFTPSCredential) x.get("rbcFTPSCredential");
    this.logger         = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
  }

  /**
   * Create the real file object and save it into the disk.
   * @param transactions a list of transactins to be sent
   * @return an EFTFile model
   */
  public EFTFile generate(List<Transaction> transactions, String spid) {
    try {
      EFTFile eftFile = createEFTFile(transactions, spid);
      if ( eftFile != null ) {
        eftFile.setFile(createFile(eftFile).getId());
        eftFile.setProvider("RBC"); // TODO set provider appropriately
        return (EFTFile) ((DAO) this.x.get("eftFileDAO")).put(eftFile);
      }
    } catch (Throwable t) {
      this.logger.error("RBC Error generating EFT File. " + t.getMessage(), t);
      throw new RbcEftFileException("RBC Error generating EFT File. " + t.getMessage(), t);
    }
    return null;
  }

  /**
   * Create the real file object and save it into the disk.
   * @param eftFile the EFTFile Object created from createEFTFile method
   * @return the real file object
   */
  public foam.nanos.fs.File createFile(EFTFile eftFile) {
    if ( eftFile == null ) return null;

    try {
      /* create and store in FileDAO */
      InputStream in = new ByteArrayInputStream(eftFile.getContent().getBytes());
      return EFTFileUtil.storeEFTFile(this.x, in, eftFile.getFileName()
        , Long.valueOf(eftFile.getContent().getBytes().length), "text/plain");
    } catch (Throwable e) {
      this.logger.error("Error when create rbc eft file with name - " + eftFile.getFileName(), e);
      throw new RbcFTPSException("Error when create rbc eft file with name - " + eftFile.getFileName(), e);
    }
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

  protected EFTFile createEFTFile(List<Transaction> transactions, String spid) {

    if ( transactions == null || transactions.isEmpty() ) {
      return null;
    }

    try {
      EFTFile eftFile = null;
      if ( transactions.get(0) instanceof CITransaction ) {
        eftFile = createCIEFTFile(transactions, spid);
      } else {
        eftFile = createCOEFTFile(transactions, spid);
      }
      return eftFile;
    } catch ( Exception e ) {
      this.passedTransactions.clear();
      logger.error("Error when creating EFT File: " + e.getMessage(), e);
      throw e;
    }
  }

  protected EFTFile createCIEFTFile(List<Transaction> ciTransactions, String spid) {
    RBCTransactionISO20022Util transactionISO20022Util = new RBCTransactionISO20022Util();
    try {
      EFTFile eftFile = new EFTFile.Builder(x).setSpid(spid).build();
      eftFile = (EFTFile) eftFileDAO.inX(x).put(eftFile);
      String messageFileId = spid + eftFile.getId();
      RbcCIRecord ciRecords = transactionISO20022Util.generateCIRecords(x, ciTransactions.toArray(new Transaction[ciTransactions.size()]), messageFileId);
      if ( ciRecords != null && ciRecords.getDebitMsg() != null ) {
        ciRecords.setTransmissionHeader(transmissionHeader(rbcCredential));
        this.passedTransactions.addAll(Arrays.asList(ciRecords.getTransactions()));
        eftFile.setFileName(eftFile.getId() + "-debit" + ".txt");
        String content = ciRecords.toPain00800102XML();
        content = replaceInbetweenTag(content, "<ReqdColltnDt>", "</ReqdColltnDt>"); // TODO an Ugly hack pending when ISODate outputter is fixed
        content = replaceInbetweenTag(content, "<RltdDt>", "</RltdDt>");
        eftFile.setContent(content);
        eftFile.setFileCreationTimeEDT(getCurrentDateTimeEDT());
        return (EFTFile) eftFileDAO.inX(x).put(eftFile);
      } else {
        eftFileDAO.inX(x).remove(eftFile);
      }
    } catch (Exception e) {
      this.logger.error("Error creating RBC EFT file", e);
      Notification notification = new Notification.Builder(x)
        .setTemplate("NOC")
        .setBody("RBC Failed to create EFT File for CI Transactions: " + e.getMessage() )
      .build();
      ((DAO) x.get("localNotificationDAO")).put(notification);
    }
    return null;
  }

  protected EFTFile createCOEFTFile(List<Transaction> coTransactions, String spid) {
    RBCTransactionISO20022Util    transactionISO20022Util = new RBCTransactionISO20022Util();
    try {
      EFTFile eftFile = new EFTFile.Builder(x).setSpid(spid).build();
      eftFile = (EFTFile) eftFileDAO.inX(x).put(eftFile);
      String messageFileId = spid + eftFile.getId();
      RbcCORecord coRecords = transactionISO20022Util.generateCORecords(x, coTransactions.toArray(new Transaction[coTransactions.size()]), messageFileId);
      if ( coRecords != null && coRecords.getCreditMsg() != null ){
        coRecords.setTransmissionHeader(transmissionHeader(rbcCredential));
        this.passedTransactions.addAll(Arrays.asList(coRecords.getTransactions()));
        eftFile.setFileName(eftFile.getId() + "-credit" + ".txt");
        String content = coRecords.toPain00100103XML();
        content = replaceInbetweenTag(content, "<ReqdExctnDt>", "</ReqdExctnDt>"); // TODO an Ugle hack pending when ISODate outputter is fixed
        content = replaceInbetweenTag(content, "<RltdDt>", "</RltdDt>");
        eftFile.setContent(content);
        eftFile.setFileCreationTimeEDT (getCurrentDateTimeEDT());
        return (EFTFile) eftFileDAO.inX(x).put(eftFile);
      } else{
        eftFileDAO.inX(x).remove(eftFile);
      }
    } catch (Exception e) {
      this.logger.error("Error creating RBC EFT file", e);
      Notification notification = new Notification.Builder(x)
        .setTemplate("NOC")
        .setBody("RBC Failed to create EFT File for CO Transactions: " + e.getMessage() )
      .build();
      ((DAO) x.get("localNotificationDAO")).put(notification);
    }
    return null;
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

    while(m.find()) {
      String valueFromTags = m.group(1);
      m.appendReplacement(sb, starttag + valueFromTags.substring(0, Math.min(valueFromTags.length(), 10)) + endtag);
    }
    m.appendTail(sb);
    String result = sb.toString();
    System.out.println(result);
    return result;
  }

  public ArrayList<Transaction> getPassedTransactions() {
    return passedTransactions;
  }

}
