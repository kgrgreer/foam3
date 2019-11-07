package net.nanopay.security.test;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.List;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyPair;
import java.security.Security;
import java.security.KeyPairGenerator;
import java.util.Date;
import javax.crypto.SecretKey;

import net.nanopay.security.PGPKeyUtil;
import net.nanopay.security.PgpPublicKeyWrapper;
import net.nanopay.security.PgpPrivateKeyWrapper;
import net.nanopay.security.KeyPairEntry;
import net.nanopay.security.PublicKeyEntry;
import net.nanopay.security.PrivateKeyDAO;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.openpgp.PGPException;
import org.bouncycastle.openpgp.PGPKeyPair;
import org.bouncycastle.openpgp.PGPPrivateKey;
import org.bouncycastle.openpgp.PGPPublicKey;
import org.bouncycastle.bcpg.RSASecretBCPGKey;
import org.bouncycastle.openpgp.operator.jcajce.JcaPGPKeyConverter;
import java.security.interfaces.RSAPrivateCrtKey;

import static foam.mlang.MLang.*;


public class PGPKeyUtilTest
    extends foam.nanos.test.Test {
  X x;
  Path file = Paths.get("/tmp/pgptestfile");
  String cipherTextFile = "/tmp/cipherTestfile.txt";
  String outputFile = "/tmp/outputTestfile.txt";
  String NANOPAY_RBC_ALIAS = "nanopay-rbc-pgpkey";
  String RBC_ALIAS = "rbc-pgpkey";
  String paraphrase = "nanopay";  

  @Override
  public void runTest(X x) {
    x = SecurityTestUtil.CreateSecurityTestContext(x);
    this.x = x;
    setUpTest();
  }

  private void setUpTest() {
    try {
      createTestPGPKeys();
      List<String> lines = Arrays.asList("The first line", "The second line");
      Files.write(file, lines, StandardCharsets.UTF_8);
      FileOutputStream out = new FileOutputStream(cipherTextFile);
      
      PGPKeyUtil.encryptFile(this.x, file.toFile(), RBC_ALIAS , out);
      File cipherFile = new File(cipherTextFile);
      boolean empty = ! cipherFile.exists() || cipherFile.length() == 0;
      test(! empty, "Encrypted file is not empty" );

      FileOutputStream fOut = new FileOutputStream(outputFile);
      PGPKeyUtil.decryptFile(this.x, new FileInputStream(cipherFile), fOut, NANOPAY_RBC_ALIAS);
      File testOutFile = new File(outputFile);
      empty = ! testOutFile.exists() || testOutFile.length() == 0;
      test(! empty, "File was decrypted fine" );
      List<String> result = Files.readAllLines(Paths.get(outputFile));
      test(lines.size() ==  result.size(), "Decrypted file has same line count as original file" );
      test(lines.get(0).equals(result.get(0)), "Decrypted file and original file has the same content" );

    } catch (Exception ex) {
      ex.printStackTrace();
      test(false, "File encryption fails: " + ex.getMessage());
    }
  }

  protected void createTestPGPKeys() {
    try{
		Security.addProvider(new BouncyCastleProvider());
		KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA", "BC");
		kpg.initialize(2048);
    KeyPair kp = kpg.generateKeyPair();
    PGPPublicKey a = (new JcaPGPKeyConverter().getPGPPublicKey(PGPPublicKey.RSA_GENERAL, kp.getPublic(), new Date()));
    RSAPrivateCrtKey rsK = (RSAPrivateCrtKey)kp.getPrivate();
    RSASecretBCPGKey privPk = new RSASecretBCPGKey(rsK.getPrivateExponent(), rsK.getPrimeP(), rsK.getPrimeQ());
    PGPPrivateKey b = new PGPPrivateKey(a.getKeyID(), a.getPublicKeyPacket(), privPk);
    if ( b == null ) throw new RuntimeException("Unable to create PGP Private Key"); 

    PgpPublicKeyWrapper publicKey = new PgpPublicKeyWrapper(a);
    PgpPrivateKeyWrapper privateKey = new PgpPrivateKeyWrapper(b); 
    KeyPairEntry keyPairEntry = new KeyPairEntry.Builder(x).setAlgorithm(publicKey.getAlgorithm())
    .setAlias(NANOPAY_RBC_ALIAS).setPrivateKey(privateKey).setPublicKey(publicKey).build();
    PrivateKeyDAO privateKeyDAO = (PrivateKeyDAO) x.get("privateKeyDAO");
    SecretKey key = privateKeyDAO.getSecretKey();
    ((DAO) x.get("keyPairDAO")).put(keyPairEntry);

    PublicKeyEntry rbcPublicKeyEntry = new PublicKeyEntry.Builder(x).setAlgorithm(publicKey.getAlgorithm())
          .setAlias(RBC_ALIAS).setPublicKey(publicKey).build();
        ((DAO) x.get("publicKeyDAO")).put(rbcPublicKeyEntry);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

}
