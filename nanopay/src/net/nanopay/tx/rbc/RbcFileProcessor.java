package net.nanopay.tx.rbc;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.locks.ReentrantLock;
import java.util.Date;

import net.nanopay.iso20022.ISO20022Util;
import net.nanopay.iso20022.Pain00200103;
import net.nanopay.tx.cico.EFTFileStatus;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.rbc.exceptions.RbcFTPSException;
import net.nanopay.tx.rbc.exceptions.RbcIsoFileException;
import net.nanopay.tx.rbc.ftps.RbcFTPSClient;
import net.nanopay.tx.rbc.iso20022file.RbcISO20022File;
import net.nanopay.tx.rbc.RbcPGPUtil;
import net.nanopay.tx.TransactionEvent;

import org.apache.commons.io.FileUtils;


public class RbcFileProcessor {

  private X x;
  private DAO transactionDAO;
  private Logger logger;
  RbcFTPSClient rbcFTPSClient;
  protected static ReentrantLock SEND_LOCK = new ReentrantLock();

  public RbcFileProcessor(X x) {
    this.x          = x;
    logger          = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    transactionDAO  = (DAO) x.get("localTransactionDAO");
    rbcFTPSClient   = new RbcFTPSClient(x);
  }

  /**
   * Convert RbcISO20022File to File and send 
   */
  public RbcISO20022File send(long fileId) {
    boolean isSent = false;
    DAO rbcISOFileDAO = (DAO) x.get("rbcISOFileDAO");
    RbcISO20022File isoFile = (RbcISO20022File) rbcISOFileDAO.inX(x).find(fileId);
    if ( isoFile == null ) return isoFile;
    isoFile = (RbcISO20022File)isoFile.fclone();
    try{
      File readyTosend = createEncryptedFile(createFile(isoFile));
      send(readyTosend);
      isSent = true;
      isoFile.setStatus(EFTFileStatus.SENT);
      isoFile.setFailureReason(""); // clear just in case it faile previously
    } catch ( Exception e ) {
      logger.error("RBC Sending file failed: " + e.getMessage(), e);
      BmoFormatUtil.sendEmail(x, "RBC sending file failed " + isoFile.getFileName(), e);
      isoFile.setStatus(EFTFileStatus.FAILED);
      isoFile.setFailureReason(e.getMessage());
    } finally {
      rbcISOFileDAO.inX(x).put(isoFile);
    }
    return isoFile;
  }

  /**
   * Process the receipt report
   */
  protected void send(File file) {
    if ( file == null ) return;
                    
    /* we will need to lock the sending process. We want to make sure only send one file at a time.*/
    SEND_LOCK.lock();

    /* Sending file to RBC */
    try {

      rbcFTPSClient.send(file);

    } catch ( Exception e ) {
      logger.error("RBC Sending file failed: " + e.getMessage(), e);
      throw new RbcIsoFileException("RBC Sending file failed " + e.getMessage(), e);
    } finally {
      if ( SEND_LOCK.isLocked() ) {
        SEND_LOCK.unlock();
      }
    }
  }

  /**
   * Encrypt file. Return the encrypted file
   */
  protected File createEncryptedFile(File file) throws RbcIsoFileException{
    if ( file == null ) return null;
    File encrypted = null;
    try{
      encrypted = new RBCEFTFileGenerator(x).createEncryptedFile(file);
    } catch ( Exception e ) {
      logger.error("RBC Encrypting file : " + e.getMessage(), e);
      throw new RbcIsoFileException("RBC Encrypting file", e);
    } 
    return encrypted;
  }

  /**
   * Encrypt file. Return the encrypted file
   */
  protected File createFile(RbcISO20022File isoFile) throws RbcIsoFileException{
    if ( isoFile == null ) return null;
    File file = null;
    try{
      file = new RBCEFTFileGenerator(x).createFile(isoFile);
    } catch ( Exception e ) {
      logger.error("RBC creating file : " + e.getMessage(), e);
      throw new RbcIsoFileException("RBC creating file " + e.getMessage(), e);
    } 
    return file;
  }
   
}
