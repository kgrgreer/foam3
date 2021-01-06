package net.nanopay.tx.bmo;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;

import java.io.File;
import java.util.ArrayList;
import java.util.concurrent.locks.ReentrantLock;
import java.util.Date;
import org.apache.commons.io.FileUtils;

import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.cico.EFTFileStatus;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.bmo.cico.BmoCOTransaction;
import net.nanopay.tx.bmo.cico.BmoTransaction;
import net.nanopay.tx.bmo.cico.BmoVerificationTransaction;
import net.nanopay.tx.bmo.eftfile.BmoEftFile;
import net.nanopay.tx.bmo.exceptions.BmoEftFileException;
import net.nanopay.tx.bmo.exceptions.BmoSFTPException;
import net.nanopay.tx.cico.EFTFileUtil;

public class BmoFileProcessor {

  private X x;
  private Logger logger;
  BmoSFTPCredential sftpCredential;
  protected static ReentrantLock SEND_LOCK = new ReentrantLock();

  public BmoFileProcessor(X x) {
    this.x          = x;
    logger          = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));
    sftpCredential  = (BmoSFTPCredential) x.get("bmoSFTPCredential");
  }

  public void sendAndVerify(EFTFile eftFile) {
    try {
      /* we will need to lock the sending process. We want to make sure only send one file at a time.*/
      SEND_LOCK.lock();

      send(eftFile);

      verifyReceipt(eftFile);

    } catch ( Exception e ) {
        logger.error("BMO Sending file failed: " + e.getMessage(), e);
        throw e;
    } finally {
      if ( SEND_LOCK.isLocked() ) {
        SEND_LOCK.unlock();
      }
    }
  }

  /**
   * Convert EFTFile to java File and send 
   */
  public void send(EFTFile eftFile) {
    if ( eftFile == null ) return;

    DAO fileDAO = ((DAO) x.get("fileDAO")).inX(x);
    try{
      foam.nanos.fs.File file = (foam.nanos.fs.File) fileDAO.find(eftFile.getFile());
      if ( file == null ) 
        throw new RuntimeException("BMO unable to find in file system for EFT File: " + eftFile.getFileName());
      
      send(EFTFileUtil.getFile(x, file));
      eftFile.setStatus(EFTFileStatus.SENT);
      eftFile.setFailureReason(""); // clear just in case it faile previously
      
    } catch ( Exception e ) {
      logger.error("BMO Sending file failed: " + e.getMessage(), e);
      BmoFormatUtil.sendEmail(x, "BMO sending file failed " + eftFile.getFileName(), e);
      eftFile.setStatus(EFTFileStatus.FAILED);
      eftFile.setFailureReason(e.getMessage());
      eftFile.setRetries(eftFile.getRetries() + 1);
      throw e;
    } finally {
      ((DAO) x.get("bmoEftFileDAO")).inX(x).put((BmoEftFile) eftFile);
    }
  }


  protected void send(File file) {
    if ( ! sftpCredential.getSkipSendFile() ) {
      try {
        new BmoSFTPClient(x, sftpCredential).upload(file);
      } catch ( Exception e ) {
        logger.error("BMO Sending file failed: " + e.getMessage(), e);
        throw new BmoEftFileException("BMO Sending file failed " + e.getMessage(), e);
      }
    }
  }

  protected void verifyReceipt(EFTFile eftFile) {    
    /* Fetch and process the receipt file, any exception happened during this process, set the transaction status to Failed */
    try {
      File receipt = new BmoSFTPClient(x, sftpCredential).downloadReceipt();
      
      if ( ! new BmoReportProcessor(x).processReceipt(receipt, ((BmoEftFile) eftFile).getHeaderRecord().getFileCreationNumber()) ) throw new BmoSFTPException("Failed when verify receipt.");
      eftFile.setStatus(EFTFileStatus.ACCEPTED);

      try {
        foam.nanos.fs.File f = EFTFileUtil.storeEFTFile(this.x, receipt, "text/csv"); 
        eftFile.setReceipt(f.getId());
        FileUtils.deleteQuietly(receipt);
      } catch(Exception e) {
        logger.error("BMO Error while saving recipt", e);
      }

    } catch ( Exception e ) {
      // Get transactions marked with file number and update to FAILED
      updateFailedReceipt(((BmoEftFile)eftFile).getHeaderRecord().getFileCreationNumber());
      eftFile.setStatus(EFTFileStatus.REJECTED);
      throw e;
    } finally {
      ((DAO) x.get("bmoEftFileDAO")).inX(x).put((BmoEftFile) eftFile);
    }
  }

  protected void updateFailedReceipt(int fileNumber) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    Predicate condition1 = MLang.EQ(
      Transaction.STATUS, TransactionStatus.SENT
    );

    Predicate condition2 = MLang.OR(
      MLang.EQ(BmoCITransaction.BMO_FILE_CREATION_NUMBER, fileNumber),
      MLang.EQ(BmoCOTransaction.BMO_FILE_CREATION_NUMBER, fileNumber),
      MLang.EQ(BmoVerificationTransaction.BMO_FILE_CREATION_NUMBER, fileNumber)
    );

    ArraySink sink = (ArraySink) transactionDAO.where(
      MLang.AND(condition1, condition2)
    ).select(new ArraySink());
    ArrayList<Transaction> transactions = (ArrayList<Transaction>) sink.getArray();

    // update the transaction
    for ( Transaction transaction : transactions ) {
      try {
        transactionDAO.inX(x).put(transaction);
      } catch ( Exception e ) {
        logger.error("Transaction " + transaction.getId() + " updated failed, please update manually", e);
        BmoFormatUtil.sendEmail(x, "Transaction " + transaction.getId() + " updated failed, please update manually", e);
      }
    }
  }
   
}
