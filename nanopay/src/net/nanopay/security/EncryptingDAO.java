package net.nanopay.security;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import foam.mlang.sink.Max;
import foam.nanos.logger.Logger;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.security.*;
import java.util.Base64;

/** Adapt objects into EncryptedObject's before being stored. **/
public class EncryptingDAO
  extends ProxyDAO
{
  static {
    // load bouncy castle provider
    BouncyCastleProvider provider = new BouncyCastleProvider();
    if (Security.getProvider(provider.getName()) == null ) {
      Security.addProvider(provider);
    }
  }

  protected static final int AES_KEY_SIZE     = 256;
  protected static final int GCM_NONCE_LENGTH = 12;
  protected static final int GCM_TAG_LENGTH   = 16;

  private static SecureRandom random;
  private static SecureRandom getSecureRandom() throws NoSuchAlgorithmException {
    if ( random == null ) {
      random = SecureRandom.getInstance("SHA1PRNG");
    }
    return random;
  }

  protected String alias_;
  protected SecretKey key_;
  protected net.nanopay.security.KeyStoreManager manager_;

  protected Logger     logger_;
  protected JSONParser jsonParser_;
  protected Outputter  outputter_ = new Outputter(OutputterMode.STORAGE);

  public EncryptingDAO(X x, ClassInfo of, DAO delegate)
      throws KeyStoreException, NoSuchAlgorithmException, UnrecoverableEntryException, NoSuchProviderException
  {
    setX(x);
    setOf(of);
    setDelegate(delegate);

    alias_ = of.getId();
    logger_ = (Logger) x.get("logger");
    manager_ = (net.nanopay.security.KeyStoreManager) x.get("keyStoreManager");
    jsonParser_ = getX().create(JSONParser.class);

    // get instance of keystore, load keystore file
    KeyStore keyStore = manager_.getKeyStore();

    // check if keystore contains alias. load if it does, create if it doesn't
    if ( ! keyStore.containsAlias(alias_) ) {
      // generate AES key using BC as provider
      KeyGenerator keygen = KeyGenerator.getInstance("AES", "BC");
      keygen.init(AES_KEY_SIZE, getSecureRandom());
      key_ = keygen.generateKey();

      // set secret key entry in keystore
      KeyStore.SecretKeyEntry secretKeyEntry = new KeyStore.SecretKeyEntry(key_);
      manager_.storeKey(alias_, secretKeyEntry);
    } else {
      // load the secret key
      KeyStore.SecretKeyEntry entry = (KeyStore.SecretKeyEntry) manager_.loadKey(alias_);
      key_ = entry.getSecretKey();
    }
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
    } catch (Throwable t) {
      logger_.error(t);
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
    } catch (Throwable t) {
      logger_.error(t);
      return null;
    }
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( predicate == null && ( sink instanceof Count || sink instanceof Max ) ) {
      return super.select_(x, sink, skip, limit, order, predicate);
    }

    getDelegate().inX(x).select(new DecryptingSink(x, this, decorateSink_(sink, skip, limit, order, predicate)));
    return sink;
  }
}
