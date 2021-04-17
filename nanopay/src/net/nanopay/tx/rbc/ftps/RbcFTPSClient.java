package net.nanopay.tx.rbc.ftps;

import foam.core.X;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.om.OMLogger;
import net.nanopay.tx.cico.EFTFile;
import org.apache.commons.io.FileUtils;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPFile;
import org.apache.commons.net.ftp.FTPSClient;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class RbcFTPSClient {

  X x;
  Logger logger;
  FTPSClient ftpsClient;
  RbcFTPSCredential credential;
  private OMLogger omLogger;

  public static final String PGP_FOLDER = "outbound/3EPK/";
  public static final String PAIN_FOLDER = "outbound/XG02/";

  public static final String DOWNLOAD_FOLDER = System.getProperty("NANOPAY_HOME") + "/var" + "/rbc_aft/download/";


  /**
   * Send the file to RBC home folder
   */
  public void send(File file) throws IOException {
    if ( file == null ) return;

    this.send(new FileInputStream(new File(file.getAbsolutePath())) , file.getName());
  }

  public void send(FileInputStream in, String filename) throws IOException {
    if ( (! this.credential.getEnable() ) || this.credential.getSkipSendFile() ) {
      return;
    }

    this.login();

    this.logger.info("Start sending file: " + filename);
    this.put(in, filename);
    this.logger.info("Finish sending file: " + filename);

    this.logout();
  }

  public File downloadLast(String filePath) throws IOException {
    String filename = filePath.substring(filePath.lastIndexOf("/") + 1);

    this.login();
    FTPFile[] ftpFiles = this.ls(PAIN_FOLDER);

    String index = String.format("%" + 3 + "s", String.valueOf(ftpFiles.length)).replace(' ', '0');
    String remotePath = PAIN_FOLDER + "PAIN." + index + ".pgp";

    File file = this.get(remotePath, DOWNLOAD_FOLDER + filename);
    this.logout();

    return file;
  }

  /**
   * Download only files in the provided list
   */
  public List<File> batchDownload(String folder, List<String> fileNameFilters) throws IOException {
    if ( ! this.credential.getEnable() ) {
      return new ArrayList<>();
    }

    List<File> downloadFile = new ArrayList<>();
    this.login();

    this.logger.info("Start downloading. Listing all the files.");
    FTPFile[] ftpFiles = this.ls(folder);

    for (FTPFile ftpFile : ftpFiles) {

      if ( ! fileNameFilters.stream().anyMatch(ftpFile.getName()::contains)
        || ftpFile.getName().contains("downloaded%FTPS")
        || ftpFile.getName().contains(".cp") ) continue;

      this.logger.info("Start downloading file: " + ftpFile.getName());
      downloadFile.add(
        this.get(folder + ftpFile.getName(), DOWNLOAD_FOLDER + ftpFile.getName())
      );
      this.logger.info("Finish downloading file: " + ftpFile.getName());
    }

    this.logout();
    this.logger.info("Finish downloading all the files");
    return downloadFile;
  }

  /**
   * Download the non-downloaded pain files from RBC outbound pain folder
   */
  public List<File> batchDownload() throws IOException {
    return batchDownload(PAIN_FOLDER);
  }

  /**
   * Download the non-downloaded files from supplied RBC folder
   */
  public List<File> batchDownload(String folder) throws IOException {
    if ( ! this.credential.getEnable() ) {
      return new ArrayList<>();
    }

    List<File> downloadFile = new ArrayList<>();
    this.login();

    this.logger.info("Start downloading. Listing all the files.");
    FTPFile[] ftpFiles = this.ls(folder);

    for (FTPFile ftpFile : ftpFiles) {
      if ( ftpFile.getName().contains("downloaded%FTPS") || ftpFile.getName().contains(".cp")  ) {
        continue;
      }

      this.logger.info("Start downloading file: " + ftpFile.getName());
      downloadFile.add(
        this.get(folder + ftpFile.getName(), DOWNLOAD_FOLDER + ftpFile.getName())
      );
      this.logger.info("Finish downloading file: " + ftpFile.getName());
    }

    this.logout();
    this.logger.info("Finish downloading all the files");
    return downloadFile;
  }

  public RbcFTPSClient(X x) {
    this.init(x, null);
  }

  public RbcFTPSClient(X x, FTPSClient ftpsClient) {
    this.init(x, ftpsClient);
  }

  private void init(X x, FTPSClient ftpsClient) {
    this.x = x;
    this.ftpsClient = ftpsClient == null ? new FTPSClient("TLS", false) : ftpsClient;
    this.logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    this.credential = (RbcFTPSCredential) this.x.get("rbcFTPSCredential");
    this.omLogger = (OMLogger) x.get("OMLogger");
  }

  public boolean login() throws IOException {
    boolean result = false;
    omLogger.log("RBC login starting");

    try {
      this.ftpsClient.connect(credential.getHost(), credential.getPort());
      this.logger.info("Connect : " + this.ftpsClient.getReplyString());

      result = this.ftpsClient.login(credential.getUsername(), credential.getPassword());
      this.logger.info("Login : " + this.ftpsClient.getReplyString());

      ftpsClient.enterLocalPassiveMode();

      ftpsClient.execPBSZ(0);
      this.logger.info("PBSZ : " + this.ftpsClient.getReplyString());

      ftpsClient.execPROT("P");
      this.logger.info("PROT : " + this.ftpsClient.getReplyString());

      ftpsClient.setFileType(FTP.BINARY_FILE_TYPE);
      this.logger.info("File type : " + this.ftpsClient.getReplyString());
    } catch(IOException e) {
      omLogger.log("RBC login failed");
      this.logger.error("RBC Login failed ", e);
      throw e;
    }

    omLogger.log("RBC login complete");

    return result;
  }

  public void put(String local, String remote) throws IOException {
    try {
      this.put(new FileInputStream(new File(local)), remote);
    } catch(IOException e) {
      throw e;
    }
  }

  public void put(FileInputStream in, String remote) throws IOException {
    omLogger.log("RBC send file starting");
    try {
      ftpsClient.storeFile(remote, in);
    } catch(IOException e) {
      omLogger.log("RBC send file failed");
      this.logger.error("RBC send file failed ", e);
      throw e;
    }

    omLogger.log("RBC send file complete");
    this.logger.info(this.ftpsClient.getReplyString());
  }

  public File get(String remote, String local) throws IOException {
    File tmpFile = new File(local);
    FileUtils.touch(tmpFile);

    FileOutputStream fileOutputStream = new FileOutputStream(tmpFile);

    omLogger.log("RBC download file starting");

    try {
      ftpsClient.retrieveFile(remote, fileOutputStream);
      fileOutputStream.close();
    } catch(IOException e) {
      omLogger.log("RBC download file failed");
      this.logger.error("RBC download file failed ", e);
      throw e;
    }

    omLogger.log("RBC download file complete");
    this.logger.info("Retrieve File : " + this.ftpsClient.getReplyString());

    return tmpFile;
  }

  public FTPFile[] ls(String path) throws IOException {
    FTPFile[] ftpFiles = this.ftpsClient.listFiles(path);
    this.logger.info("List Files : " + this.ftpsClient.getReplyString());

    return ftpFiles;
  }

  public String pwd() throws IOException {
    String result = this.ftpsClient.printWorkingDirectory();
    this.logger.info("FTPs Reply String: " + this.ftpsClient.getReplyString());

    return result;
  }

  public void logout() throws IOException {
    this.ftpsClient.logout();
    this.ftpsClient.disconnect();
  }

}
