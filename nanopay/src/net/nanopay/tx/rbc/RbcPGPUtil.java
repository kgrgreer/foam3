package net.nanopay.tx.rbc;

import foam.core.X;
import net.nanopay.security.PGPKeyUtil;
import org.apache.commons.io.FileUtils;
import org.bouncycastle.openpgp.PGPException;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.NoSuchProviderException;

import org.apache.commons.io.FileUtils;

public class RbcPGPUtil {

  public static final String ENCRYPT_FOLDER = System.getProperty("NANOPAY_HOME") + "/var" + "/rbc_aft/encrypt/";
  public static final String DECRYPT_FOLDER = System.getProperty("NANOPAY_HOME") + "/var" + "/rbc_aft/decrypt/";

  public static File encrypt(X x, File fileToEncrypt) throws IOException, NoSuchProviderException, PGPException {
    File outputFile = new File(ENCRYPT_FOLDER + fileToEncrypt.getName());
    FileUtils.touch(outputFile);
    FileOutputStream fileOutputStream = new FileOutputStream(outputFile);
    try{
      PGPKeyUtil.encryptFile(x, fileToEncrypt, "rbc-pgpkey", fileOutputStream);
    } catch(Exception e) {
      FileUtils.deleteQuietly(outputFile);
      throw e;
    }

    return outputFile;
  }

  public static File decrypt(X x, File fileToDecrypt) throws Exception {
    File outputFile = new File(DECRYPT_FOLDER + fileToDecrypt.getName());
    FileUtils.touch(outputFile);
    FileOutputStream fileOutputStream = new FileOutputStream(outputFile);
    try{
      PGPKeyUtil.decryptFile(x, new FileInputStream(fileToDecrypt), fileOutputStream, "nanopay-rbc-pgpkey");
    } catch(Exception e) {
      FileUtils.deleteQuietly(outputFile);
      throw e;
    }

    return outputFile;
  }
}
