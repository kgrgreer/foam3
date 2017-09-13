package foam.dao.crypto;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.io.*;
import java.security.*;
import java.security.cert.CertificateException;

public class EncryptingDAO
    extends ProxyDAO
{
  // TODO: allow support for additional crypto providers
  static {
    // load bouncy castle provider
    BouncyCastleProvider provider = new BouncyCastleProvider();
    if (Security.getProvider(provider.getName()) == null ) {
      Security.addProvider(provider);
    }
  }

  // TODO: get alias from somewhere secure
  protected static final String ALIAS = "keypair";
  protected static final int AES_KEY_SIZE = 256;

  protected File file_;
  protected SecretKey key_;
  protected KeyStore keystore_;

  public EncryptingDAO(String keystoreFilename, ClassInfo classInfo, DAO delegate) throws NoSuchProviderException, KeyStoreException, CertificateException, NoSuchAlgorithmException, IOException, UnrecoverableEntryException {
    setOf(classInfo);
    setDelegate(delegate);

    // get instance of keystore, load keystore file
    keystore_ = KeyStore.getInstance("BKS", "BC");
    file_ = new File(keystoreFilename).getAbsoluteFile();

    // load keystore if exists, else create it
    if ( file_.exists() ) {
      loadKeyStore();
    } else {
      createKeyStore();
    }

    // load secret key if exists, else create it
    if ( keystore_.containsAlias(ALIAS) ) {
      loadSecretKey();
    } else {
      createSecretKey();
    }
  }

  /**
   * Creates a keystore if one does not exist
   * @throws IOException
   * @throws CertificateException
   * @throws NoSuchAlgorithmException
   * @throws KeyStoreException
   */
  protected void createKeyStore() throws IOException, CertificateException, NoSuchAlgorithmException, KeyStoreException {
    // TODO: get password from somewhere secure
    char[] password = "password".toCharArray();
    FileOutputStream fos = null;
    try {
      fos = new FileOutputStream(file_);
      // keystore must be "loaded" before it can be created
      keystore_.load(null, password);
      keystore_.store(fos, password);
    } finally {
      if ( fos != null )
        fos.close();
    }
  }

  /**
   * Loads keystore from a file
   * @throws IOException
   * @throws CertificateException
   * @throws NoSuchAlgorithmException
   */
  protected void loadKeyStore() throws IOException, CertificateException, NoSuchAlgorithmException {
    // TODO: get password from somewhere secure
    char[] password = "password".toCharArray();
    FileInputStream fis = null;
    try {
      fis = new FileInputStream(file_);
      keystore_.load(fis, password);
    } finally {
      if ( fis != null )
        fis.close();
    }
  }

  /**
   * Creates a new AES secret key
   * @throws NoSuchAlgorithmException
   * @throws NoSuchProviderException
   * @throws KeyStoreException
   */
  protected void createSecretKey() throws NoSuchAlgorithmException, NoSuchProviderException, KeyStoreException {
    // generate AES key using BC as provider
    SecureRandom srand = SecureRandom.getInstanceStrong();
    KeyGenerator keygen = KeyGenerator.getInstance("AES", "BC");
    keygen.init(AES_KEY_SIZE, srand);
    key_ = keygen.generateKey();

    // Store secret key in keystore
    // TODO: get password from somewhere secure
    KeyStore.ProtectionParameter protectionParameter = new KeyStore.PasswordProtection("password".toCharArray());
    KeyStore.SecretKeyEntry secretKeyEntry = new KeyStore.SecretKeyEntry(key_);
    keystore_.setEntry(ALIAS, secretKeyEntry, protectionParameter);
  }

  protected void loadSecretKey() throws UnrecoverableEntryException, NoSuchAlgorithmException, KeyStoreException {
    // load secret key from keystore
    // TODO: get password from somewhere secure
    KeyStore.ProtectionParameter protectionParameter = new KeyStore.PasswordProtection("password".toCharArray());
    KeyStore.SecretKeyEntry secretKeyEntry = (KeyStore.SecretKeyEntry) keystore_.getEntry(ALIAS, protectionParameter);
    key_ = secretKeyEntry.getSecretKey();
  }

  @Override
  public FObject put_(X x, FObject obj) {
    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    return super.find_(x, id);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return super.select_(x, sink, skip, limit, order, predicate);
  }
}