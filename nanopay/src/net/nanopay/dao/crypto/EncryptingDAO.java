package net.nanopay.dao.crypto;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import foam.mlang.sink.Max;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.*;
import java.security.cert.CertificateException;
import java.util.Base64;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

public class DecryptingSink
  extends ProxySink
{
  protected final DAO dao_;

  public DecryptingSink(DAO dao, Sink delegate) {
    super(delegate);
    dao_ = dao;
  }

  public void put(FObject obj, Detachable sub) {
    super.put(obj.getId(), sub);
  }
}


/** Adapt objects into EncryptedObject's before being stored. **/
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

  // TODO: think of a better alias
  protected static final String ALIAS            = "keypair";
  protected static final int    AES_KEY_SIZE     = 256;
  protected static final int    GCM_NONCE_LENGTH = 12;
  protected static final int    GCM_TAG_LENGTH   = 16;

  private static SecureRandom random;
  private static SecureRandom getSecureRandom() throws NoSuchAlgorithmException {
    if ( random == null ) {
      random = SecureRandom.getInstance("SHA1PRNG");
    }
    return random;
  }

  protected File            file_;
  protected SecretKey       key_;
  protected KeyStore        keystore_;
  protected JSONParser      jsonParser_;
  protected final Outputter outputter_ = new Outputter();

  public EncryptingDAO(X x, String keystoreFilename, ClassInfo classInfo, DAO delegate)
    throws NoSuchProviderException, KeyStoreException, CertificateException, NoSuchAlgorithmException, IOException, UnrecoverableEntryException
  {
    setX(x);
    setOf(classInfo);
    setDelegate(delegate);

    // get instance of keystore, load keystore file
    keystore_ = KeyStore.getInstance("BKS", "BC");
    file_ = new File(keystoreFilename).getAbsoluteFile();
    jsonParser_ = new JSONParser();
    jsonParser_.setX(getX());

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
  protected void createSecretKey() throws NoSuchAlgorithmException, NoSuchProviderException, KeyStoreException, IOException, CertificateException {
    // generate AES key using BC as provider
    KeyGenerator keygen = KeyGenerator.getInstance("AES", "BC");
    keygen.init(AES_KEY_SIZE, getSecureRandom());
    key_ = keygen.generateKey();

    // set secret key entry in keystore
    // TODO: get password from somewhere secure
    KeyStore.ProtectionParameter protectionParameter = new KeyStore.PasswordProtection("password".toCharArray());
    KeyStore.SecretKeyEntry secretKeyEntry = new KeyStore.SecretKeyEntry(key_);
    keystore_.setEntry(ALIAS, secretKeyEntry, protectionParameter);

    // save keystore
    FileOutputStream fos = null;
    try {
      fos = new FileOutputStream(file_);
      keystore_.store(fos, "password".toCharArray());
    } finally {
      if ( fos != null )
        fos.close();
    }
  }

  /**
   * Loads the secret key from the keystore
   * @throws UnrecoverableEntryException
   * @throws NoSuchAlgorithmException
   * @throws KeyStoreException
   */
  protected void loadSecretKey() throws UnrecoverableEntryException, NoSuchAlgorithmException, KeyStoreException {
    // load secret key from keystore
    // TODO: get password from somewhere secure
    KeyStore.ProtectionParameter protectionParameter = new KeyStore.PasswordProtection("password".toCharArray());
    KeyStore.SecretKeyEntry secretKeyEntry = (KeyStore.SecretKeyEntry) keystore_.getEntry(ALIAS, protectionParameter);
    key_ = secretKeyEntry.getSecretKey();
  }

  @Override
  public FObject put_(X x, FObject obj) {
    try {
      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding", "BC");
      final byte[] nonce = new byte[GCM_NONCE_LENGTH];
      getSecureRandom().nextBytes(nonce);
      GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, nonce);
      cipher.init(Cipher.ENCRYPT_MODE, key_, spec);

      byte[] input = outputter_.stringify(obj).getBytes();
      byte[] cipherText = cipher.doFinal(input);

      // prefix cipher text with nonce for decrypting later
      byte[] nonceWithCipherText = new byte[nonce.length + cipherText.length];
      System.arraycopy(nonce, 0, nonceWithCipherText, 0, nonce.length);
      System.arraycopy(cipherText, 0, nonceWithCipherText, nonce.length, cipherText.length);

      // fetch id, convert from long to string if necessary
      Object id = obj.getProperty("id");
      String objectId = ( id instanceof String ) ? (String) id : Long.toString((Long) id, 10);

      // store encrypted object instead of original object
      EncryptedObject encryptedObject = new EncryptedObject();
      encryptedObject.setId(objectId);
      encryptedObject.setData(Base64.getEncoder().encodeToString(nonceWithCipherText));

      return super.put_(x, encryptedObject);
    } catch (Exception e) {
      // TODO: rethrow as DAOException
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public FObject find_(X x, Object id) {
    try {
      String objectId = ( id instanceof String ) ? (String) id : Long.toString((Long) id, 10);
      EncryptedObject encryptedObject = (EncryptedObject) super.find_(x, objectId);
      byte[] data = Base64.getDecoder().decode(encryptedObject.getData());

      final byte[] nonce = new byte[GCM_NONCE_LENGTH];
      final byte[] cipherText = new byte[data.length - GCM_NONCE_LENGTH];

      // copy nonce and ciphertext
      System.arraycopy(data, 0, nonce, 0, nonce.length);
      System.arraycopy(data, nonce.length, cipherText, 0, cipherText.length);

      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding", "BC");
      GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, nonce);
      cipher.init(Cipher.DECRYPT_MODE, key_, spec);

      byte[] plainText = cipher.doFinal(cipherText);
      return this.jsonParser_.parseString(new String(plainText));
    } catch (Exception e) {
      // TODO: rethrow as DAOException
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( predicate == null && ( sink instanceof Count || sink instanceof Max ) ) {
      return super.select_(x, sink, skip, limit, order, predicate);
    }

    super.inX(x).select(new DecryptingSink(decorateSink_(sink, skip, limit, order, predicate));
  }
}
