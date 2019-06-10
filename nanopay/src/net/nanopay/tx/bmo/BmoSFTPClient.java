package net.nanopay.tx.bmo;

import com.jcraft.jsch.*;
import com.sun.org.apache.regexp.internal.RE;
import com.sun.org.apache.xpath.internal.operations.Bool;
import foam.core.X;
import javassist.ClassPool;
import net.nanopay.tx.bmo.exceptions.BmoSFTPException;
import net.schmizz.sshj.SSHClient;
import net.schmizz.sshj.sftp.RemoteResourceInfo;
import net.schmizz.sshj.sftp.SFTPClient;
import net.schmizz.sshj.sftp.SFTPEngine;
import net.schmizz.sshj.sftp.StatefulSFTPClient;
import net.schmizz.sshj.transport.verification.PromiscuousVerifier;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PipedInputStream;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.concurrent.locks.ReentrantLock;

public class BmoSFTPClient {

  private SSHClient sshClient = null;
  private StatefulSFTPClient statefulSFTPClient = null;
  private BmoSFTPCredential credential = null;

  private static final String PATH = System.getenv("JOURNAL_HOME") + "/bmo_eft/";
  public static final String RECEIPT_DOWNLOAD_FOLDER = PATH + "/receipt/";
  public static final String REPORT_DOWNLOAD_FOLDER = PATH + "/report/";


  private static final String SEND_FOLDER = "DEFT-DEFT-A:/*BIN/NANOPAY";
//  private static final String SEND_FOLDER = "sftpuser";
  private static final String POLLABLE_FOLDER = "BMOCOM-SEND:/./POLLABLE";
//  private static final String POLLABLE_FOLDER = "/sftpuser/pollable";

  private static ReentrantLock SEND_LOCK = new ReentrantLock();

  public BmoSFTPClient(X x, BmoSFTPCredential credential) {
    this.init(x, credential);
  };

  private BmoSFTPClient init(X x, BmoSFTPCredential credential) {
    this.credential = credential;
    if ( credential.getEnable() == false ) {
      throw new BmoSFTPException("BMO SFTP not enable.");
    }

    return this;
  }

  private BmoSFTPClient connect(String loginId) throws Exception {
    ChannelSftp sftp = new ChannelSftp();

    sshClient = new SSHClient();
    sshClient.addHostKeyVerifier(new PromiscuousVerifier());
    sshClient.connect(this.credential.getHost());
    sshClient.authPassword(loginId, this.credential.getPassword());

    statefulSFTPClient = new StatefulSFTPClient(new SFTPEngine(sshClient).init());

    return this;
  }

  public Boolean unProcessedReceiptFiles() {
    try {
      System.out.println("check unprocessed receipt files.");
      this.connect(this.credential.getReceiptFileLoginId());
      this.statefulSFTPClient.cd(POLLABLE_FOLDER);
      List<RemoteResourceInfo> ls = this.statefulSFTPClient.ls();
      ls.forEach(l -> System.out.println(l.getName()));

      return ls.size() > 0;
    } catch (Exception e) {
      e.printStackTrace();
      throw new BmoSFTPException("BMO: Error when check receipt files.", e.getCause());
    } finally {
      this.disconnect();
      System.out.println("finish check unprocessed receipt files.");
    }
  }

  public void upload(File file) {

    try {
      System.out.println("Uploading.......");
      if ( unProcessedReceiptFiles() ) {
        throw new BmoSFTPException(
          "BMO: unprocessed receipt files exist on 'ADW35691-RECEIPT:'. Might cause duplicate transactions." +
          "Please make sure all previous transactions have been successfully delivered.");
      }

      this.connect(this.credential.getSendLoginId());
      this.statefulSFTPClient.cd(SEND_FOLDER);
      this.statefulSFTPClient.put(file.getAbsolutePath(), "");

    } catch ( BmoSFTPException e ) {
      throw e;
    } catch (Exception e) {
      e.printStackTrace();
      throw new BmoSFTPException("BMO: Error when send file.", e.getCause());
    } finally {
      this.disconnect();
      System.out.println("finish uploading....");
    }
  }

  public File downloadReceipt() {

    try {
      this.connect(this.credential.getReceiptFileLoginId());
      this.statefulSFTPClient.cd(POLLABLE_FOLDER);

      List<RemoteResourceInfo> ls = null;
      int re = 0;
      while ( re <= 30 ) {
        System.out.println("start: " + re);
        Thread.sleep(30 * 1000);
        ls = this.statefulSFTPClient.ls();
        if ( ls.size() != 0 ) {
          break;
        }
        re++;
      }
      System.out.println("end: " + re);

      if ( ls.size() == 0 ) {
        this.disconnect();
        throw new BmoSFTPException("Bmo: EFT file not delivered.");
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
      e.printStackTrace();
      throw new BmoSFTPException("BMO: Error when download receipt.", e.getCause());
    } finally {
      this.disconnect();
    }

  }

  public void downloadReports() {
    this.download(this.credential.getCreditReportLoginId(), REPORT_DOWNLOAD_FOLDER);
    this.download(this.credential.getDebitReportLoginId(), REPORT_DOWNLOAD_FOLDER);
  }

  public void download(String loginId, String downloadPath) {

    try {
      this.connect(loginId);
      this.statefulSFTPClient.cd(POLLABLE_FOLDER);

      List<RemoteResourceInfo> ls = this.statefulSFTPClient.ls();

      for (RemoteResourceInfo l : ls) {
        File newFile = new File(downloadPath + l.getName());
        FileUtils.touch(newFile);
        this.statefulSFTPClient.get(l.getPath(), newFile.getAbsolutePath());
      }

    } catch (Exception e) {
      e.printStackTrace();
      throw new BmoSFTPException("BMO: Error when get receipt file", e.getCause());
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
      throw new BmoSFTPException("BMO: Error when close the sftp connection", e.getCause());
    }

  }

}
