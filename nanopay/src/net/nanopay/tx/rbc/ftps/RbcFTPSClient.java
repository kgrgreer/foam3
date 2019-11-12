package net.nanopay.tx.rbc.ftps;

import foam.core.X;
import org.apache.commons.beanutils.MethodUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPSClient;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

public class RbcFTPSClient {

  X x;
  FTPSClient ftpsClient;

  public static final String SEND_FOLDER = "/";


  public RbcFTPSClient(X x) {
    this.x = x;
    this.ftpsClient = new FTPSClient("TLS", false);
  }

  public RbcFTPSClient(X x, FTPSClient ftpsClient) {
    this.x = x;
    this.ftpsClient = ftpsClient;
  }

  public void send(File file) throws IOException {
    this.put(file.getAbsolutePath(), SEND_FOLDER);
  }

  

  public boolean login() throws IOException {
    RbcFTPSCredential credential = (RbcFTPSCredential) this.x.get("rbcFTPSCredential");
    this.ftpsClient.connect(credential.getHost());
    return this.ftpsClient.login(credential.getUsername(), credential.getPassword());
  }

  public void put(String local, String remote) throws IOException {
    ftpsClient.setFileType(FTP.BINARY_FILE_TYPE);
    ftpsClient.storeFile(remote, new FileInputStream(new File(local)));
  }

  public File get(String remote, String local) throws IOException {
    File tmpFile = new File(local);
    FileUtils.touch(tmpFile);

    InputStream inputStream = ftpsClient.retrieveFileStream(remote);
    FileUtils.copyInputStreamToFile(inputStream, tmpFile);

    return tmpFile;
  }

  public void logout() throws IOException {
    this.ftpsClient.logout();
  }

}
