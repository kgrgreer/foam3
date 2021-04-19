package net.nanopay.tx.rbc;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;

import java.io.File;
import java.util.concurrent.locks.ReentrantLock;

import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.cico.EFTFileStatus;
import net.nanopay.tx.cico.EFTFileUtil;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.rbc.exceptions.RbcFTPSException;
import net.nanopay.tx.rbc.exceptions.RbcEftFileException;
import net.nanopay.tx.rbc.ftps.RbcFTPSClient;
import net.nanopay.tx.rbc.RbcPGPUtil;


public class RbcFileProcessor {

  private X x;
  private Logger logger;
  RbcFTPSClient rbcFTPSClient;
  protected static ReentrantLock SEND_LOCK = new ReentrantLock();

  public RbcFileProcessor(X x) {
    this.x          = x;
    logger          = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    rbcFTPSClient   = new RbcFTPSClient(x);
  }

  /**
   * Convert EFTFile to java File and send
   */
  public void send(EFTFile eftFile) {
    if ( eftFile == null ) return;

    DAO fileDAO = ((DAO) x.get("fileDAO")).inX(x);
    try {
      foam.nanos.fs.File file = (foam.nanos.fs.File) fileDAO.find(eftFile.getFile());
      if ( file == null )
        throw new RuntimeException("RBC unable to find in file system for EFT File: " + eftFile.getFileName());

      send(createEncryptedFile(EFTFileUtil.getFile(x, file)));
      eftFile.setStatus(EFTFileStatus.SENT);
      eftFile.setFailureReason(""); // clear just in case it faile previously

    } catch ( Exception e ) {
      logger.error("RBC Sending file failed: " + e.getMessage(), e);
      BmoFormatUtil.sendEmail(x, "RBC sending file failed " + eftFile.getFileName(), e);
      eftFile.setStatus(EFTFileStatus.FAILED);
      eftFile.setFailureReason(e.getMessage());
      eftFile.setRetries(eftFile.getRetries() + 1);
      throw e;
    } finally {
      ((DAO) x.get("eftFileDAO")).inX(x).put(eftFile);
    }
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
      throw new RbcEftFileException("RBC Sending file failed " + e.getMessage(), e);
    } finally {
      if ( SEND_LOCK.isLocked() ) {
        SEND_LOCK.unlock();
      }
    }
  }

  /**
   * Encrypt file. Return the encrypted file
   */
  protected File createEncryptedFile(File file) throws RbcEftFileException{
    if ( file == null ) return null;
    File encrypted = null;
    try {
      encrypted = new RBCEFTFileGenerator(x).createEncryptedFile(file);
    } catch ( Exception e ) {
      logger.error("RBC Encrypting file : " + e.getMessage(), e);
      ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
        .setName("RBC File Encryption")
        .setReason(AlarmReason.EFT)
        .setNote(e.getMessage())
        .build());
      throw new RbcEftFileException("RBC Encrypting file", e);
    }
    return encrypted;
  }

}
