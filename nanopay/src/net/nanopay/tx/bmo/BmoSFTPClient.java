package net.nanopay.tx.bmo;

import com.jcraft.jsch.ChannelSftp;
import foam.core.X;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import net.nanopay.tx.bmo.exceptions.BmoSFTPException;
import net.schmizz.sshj.SSHClient;
import net.schmizz.sshj.sftp.RemoteResourceInfo;
import net.schmizz.sshj.sftp.SFTPEngine;
import net.schmizz.sshj.sftp.StatefulSFTPClient;
import net.schmizz.sshj.transport.verification.PromiscuousVerifier;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

public class BmoSFTPClient {

  private SSHClient          sshClient          = null;
  private StatefulSFTPClient statefulSFTPClient = null;
  private BmoSFTPCredential  credential         = null;

  private static final String PATH                    = System.getProperty("NANOPAY_HOME") + "/var" + "/bmo_eft/";
  public  static final String RECEIPT_DOWNLOAD_FOLDER = PATH + "/receipt/";
  public  static final String REPORT_DOWNLOAD_FOLDER  = PATH + "/report/";
  private static final String SEND_FOLDER             = "DEFT-DEFT-A:/*BIN/NANOPAY";
  private static final String POLLABLE_FOLDER         = "BMOCOM-SEND:/./POLLABLE";

  private static ReentrantLock SEND_LOCK = new ReentrantLock();
  private Logger logger;

  public BmoSFTPClient(X x, BmoSFTPCredential credential) {
    this.init(x, credential);
    this.logger = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));
  };

  private BmoSFTPClient init(X x, BmoSFTPCredential credential) {
    this.credential = credential;
    if ( credential.getEnable() == false ) {
      throw new BmoSFTPException("BMO SFTP not enable.");
    }

    return this;
  }

  /**
   * Connect to BMO sftp server
   */
  private BmoSFTPClient connect(String loginId) throws Exception {
    ChannelSftp sftp = new ChannelSftp();
    sshClient        = new SSHClient();

    sshClient.addHostKeyVerifier (new PromiscuousVerifier());
    sshClient.connect            (this.credential.getHost());
    sshClient.authPassword       (loginId, this.credential.getPassword());

    statefulSFTPClient = new StatefulSFTPClient(new SFTPEngine(sshClient).init());

    return this;
  }

  /**
   * Check if the RECEIPT server has POLLABLE file
   */
  public Boolean unProcessedReceiptFiles() {
    try {

      this.logger.info("check unprocessed receipt files.");

      this.                     connect (this.credential.getReceiptFileLoginId());
      this.statefulSFTPClient.  cd      (POLLABLE_FOLDER);
      List<RemoteResourceInfo>  ls =
      this.statefulSFTPClient.  ls();

      return ls.size() > 0;

    } catch (Exception e) {
      this.logger.error("Error when check receipt files.", e);
      throw new BmoSFTPException("Error when check receipt files.", e.getCause());
    } finally {
      this.disconnect();
      this.logger.info("finish check unprocessed receipt files.");
    }
  }

  /**
   * Upload the EFT file to BMO SEND server
   */
  public void upload(File file) {

    try {

      this.logger.info("Uploading.......");

      // If there still POLLABLE file on RECEIPT Server
      if ( unProcessedReceiptFiles() ) {
        throw new BmoSFTPException(
          "unprocessed receipt files exist on 'ADW35691-RECEIPT:'. Might cause duplicate transactions." +
          "Please make sure all previous transactions have been successfully delivered.");
      }

      this.                    connect (this.credential.getSendLoginId());
      this.statefulSFTPClient. cd      (SEND_FOLDER);
      this.statefulSFTPClient. put     (file.getAbsolutePath(), "");

    } catch ( BmoSFTPException e ) {
      throw e;
    } catch (Exception e) {
      this.logger.error("Error when send file.", e);
      throw new BmoSFTPException("Error when send file.", e.getCause());
    } finally {
      this.disconnect();
      this.logger.info("finish uploading.");
    }
  }

  /**
   * download the receipt file
   */
  public File downloadReceipt() {

    try {
      this.connect(this.credential.getReceiptFileLoginId());
      this.statefulSFTPClient.cd(POLLABLE_FOLDER);

      List<RemoteResourceInfo> ls = null;
      int re = 0;

      // retry
      while ( re <= 30 ) {
        this.logger.info("start trying download receipt: " + re);
        Thread.sleep(30 * 1000);
        ls = this.statefulSFTPClient.ls();
        if ( ls.size() != 0 ) { break;}
        re++;
      }
      this.logger.info("finishing downloading receipt" + re);

      if ( ls.size() == 0 ) {
        this.disconnect();
        this.logger.error("EFT Receipt file not received.");
        throw new BmoSFTPException("EFT Receipt file not received.");
      }

      // Because we check the un processed receipt files before we send the eft file,
      // So we should only get one file here
      File newFile = new File(RECEIPT_DOWNLOAD_FOLDER + ls.get(0).getName());
      FileUtils.touch(newFile);
      this.statefulSFTPClient.get(ls.get(0).getPath(), newFile.getAbsolutePath());

      return newFile;
    } catch ( BmoSFTPException e ) {
      throw e;
    } catch ( Exception e ) {
      this.logger.error("Error when download receipt.", e);
      throw new BmoSFTPException("Error when download receipt.", e.getCause());
    } finally {
      this.disconnect();
    }

  }

  public void downloadReports() {
    this.logger.info("start downloading reports.");
    this.download(this.credential.getCreditReportLoginId(), REPORT_DOWNLOAD_FOLDER);
    this.download(this.credential.getDebitReportLoginId(), REPORT_DOWNLOAD_FOLDER);
    this.logger.info("finishing downloading reports.");
  }

  public void download(String loginId, String downloadPath) {

    try {
      this.                    connect (loginId);
      this.statefulSFTPClient. cd      (POLLABLE_FOLDER);

      List<RemoteResourceInfo> ls = this.statefulSFTPClient.ls();

      for (RemoteResourceInfo l : ls) {
        File newFile = new File(downloadPath + l.getName());
        FileUtils.touch(newFile);
        this.statefulSFTPClient.get(l.getPath(), newFile.getAbsolutePath());
      }

    } catch (Exception e) {
      this.logger.error("Error when downloading file", e);
      throw new BmoSFTPException("Error when downloading file", e.getCause());
    } finally {
      this.disconnect();
    }
  }

  public void disconnect() {

    try {
      if ( this.statefulSFTPClient != null ) {
        this.statefulSFTPClient.close();
      }

      if ( this.sshClient != null ) {
        this.sshClient.disconnect();
      }
    } catch ( Exception e ) {
      throw new BmoSFTPException("Error when close the sftp connection", e.getCause());
    }

  }

}
