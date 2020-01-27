package net.nanopay.tx.rbc;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;
import net.nanopay.iso20022.ISO20022Util;
import net.nanopay.iso20022.Pain00200103;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.rbc.exceptions.RbcFTPSException;
import net.nanopay.tx.rbc.ftps.RbcFTPSClient;
import net.nanopay.tx.rbc.RbcPGPUtil;
import org.apache.commons.io.FileUtils;

import java.io.File;


public class RbcReportProcessor {

  private static final String PATH = System.getProperty("NANOPAY_HOME") + "/var" + "/rbc_aft/";
  private static final String RECEIPT_PROCESSED_FOLDER = PATH + "/processed/receipt/";
  private static final String REPORT_PROCESSED_FOLDER = PATH + "/processed/report/";
  private static final String REPORT_PROCESSED_FAILED_FOLDER = PATH + "/processed/report_failed/";

  private X x;
  private DAO transactionDAO;
  private Logger logger;
  RbcFTPSClient rbcFTPSClient;

  public RbcReportProcessor(X x) {
    this.x          = x;
    logger          = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    transactionDAO  = (DAO) x.get("localTransactionDAO");
    rbcFTPSClient   = new RbcFTPSClient(x);
  }

  /**
   * Process the receipt report
   */
  public void decryptFolder(X x) {
    File folder = new File(RbcFTPSClient.DOWNLOAD_FOLDER);   
    for (File file : folder.listFiles()) {
      if ( file.isDirectory() ) continue;
      try{
        RbcPGPUtil.decrypt(x, file);
      } catch (Exception e) {
        this.logger.error("Error decrypting file: " + file.getName(), e);
      }
    }
  }

  /**
   * Process the receipt 
   */
  public boolean processReceipt(X x, long fileId) {
    /* Download file from RBC */
    File receipt = null;
    try{
      receipt = rbcFTPSClient.downloadLast(RbcFTPSClient.DOWNLOAD_FOLDER + fileId + ".txt");
    } catch (Exception e) {
      this.logger.error("Error downloading receipts from RBC ", e);
      return false;
    }

    /* Decrypt file */
    try{
      receipt = RbcPGPUtil.decrypt(x, receipt);
    } catch (Exception e) {
      this.logger.error("Error decrypting file: " + receipt.getName(), e);
      return false;
    }

    if( processReceipt(receipt, fileId) ) return true;

    return false;
  }

  /**
   * Process the receipt file
   */
  public boolean processReceipt(File file, long fileId) {
    if (file == null) return false;

    try {
      ISO20022Util driver = new ISO20022Util();
      Pain00200103 pain = (Pain00200103) driver.fromXML(x, file, Pain00200103.class);
      if ( pain == null || pain.getCstmrPmtStsRpt() == null ) return false;
      net.nanopay.iso20022.OriginalGroupInformation20 grpInfo = pain.getCstmrPmtStsRpt().getOriginalGroupInformationAndStatus();
      if ( grpInfo == null || ! String.valueOf(fileId).equals(grpInfo.getOriginalMessageIdentification()) ) return false;

      // Confirm - ACTC status should occur at least once per batch - 
      if ( null != grpInfo.getGroupStatus() && net.nanopay.iso20022.TransactionGroupStatus3Code.ACTC == grpInfo.getGroupStatus() ) { 
        FileUtils.moveFile(file, new File(RECEIPT_PROCESSED_FOLDER + "_" + fileId + "_" +  file.getName()));
        return true;
      }
    } catch (Exception e) {
      this.logger.error("Error when processing the receipt file. ", e);
      return false;
    }

    return false;
  }
}
