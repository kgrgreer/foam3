package net.nanopay.tx.rbc;

import foam.core.X;
import net.nanopay.tx.rbc.ftps.RbcFTPSClient;
import net.nanopay.tx.rbc.ftps.RbcFTPSCredential;

import java.io.File;
import java.io.IOException;

public class RbcOneOffTest {

  X x;

  public RbcOneOffTest(X x) {
    this.x = x;
    RbcFTPSCredential credential = (RbcFTPSCredential) x.get("rbcFTPSCredential");
    if ( ! credential.getUsername().equals("TESTE8S8") ) {
      throw new RuntimeException("Please use Test Account to do the test.");
    }
  }

  public void testSend(File file) throws Exception {
    RbcFTPSClient ftpsClient = new RbcFTPSClient(x);

    // 1. encrypt the file
    File encryptFile = RbcPGPUtil.encrypt(x, file);

    // 2. send the file
    ftpsClient.send(encryptFile);
  }

  public void testDownload(String remotePath) throws Exception {
    RbcFTPSClient ftpsClient = new RbcFTPSClient(x);

    // 1. download the file
    File downloadFile = ftpsClient.downloadLast(remotePath);

    // 2. decrypt the file
    File decrypFile = RbcPGPUtil.decrypt(x, downloadFile);
  }

}
