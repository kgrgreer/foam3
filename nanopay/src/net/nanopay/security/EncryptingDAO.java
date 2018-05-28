package net.nanopay.security;

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
import foam.nanos.logger.Logger;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.nio.charset.StandardCharsets;
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

  protected String          alias_;
  protected SecretKey       key_;
  protected KeyStoreManager manager_;
  protected Logger          logger_;

  public EncryptingDAO(X x, ClassInfo of, DAO delegate)
      throws KeyStoreException, NoSuchAlgorithmException, NoSuchProviderException
  {
    setX(x);
    setOf(of);
    setDelegate(delegate);

    alias_ = of.getId();
    logger_ = (Logger) x.get("logger");
    manager_ = (net.nanopay.security.KeyStoreManager) x.get("keyStoreManager");

    // get instance of keystore, load keystore file
    KeyStore keyStore = manager_.getKeyStore();

    // check if keystore contains alias. load if it does, create if it doesn't
    if ( ! keyStore.containsAlias(alias_) ) {
      // generate AES key using BC as provider
      KeyGenerator keygen = KeyGenerator.getInstance("AES", "BC");
      keygen.init(AES_KEY_SIZE, SecureRandom.getInstance("SHA1PRNG"));
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
      SecureRandom.getInstance("SHA1PRNG").nextBytes(nonce);
      GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, nonce);
      cipher.init(Cipher.ENCRYPT_MODE, key_, spec);

      Outputter outputter = x.create(Outputter.class);
      byte[] input = outputter.stringify(obj).getBytes(StandardCharsets.UTF_8);
      byte[] cipherText = new byte[cipher.getOutputSize(input.length)];
      int updated = cipher.update(input, 0, input.length, cipherText, 0);
      cipher.doFinal(cipherText, updated);

      // prefix cipher text with nonce for decrypting later
      byte[] nonceWithCipherText = new byte[nonce.length + cipherText.length];
      System.arraycopy(nonce, 0, nonceWithCipherText, 0, nonce.length);
      System.arraycopy(cipherText, 0, nonceWithCipherText, nonce.length, cipherText.length);

      // store encrypted object instead of original object
      EncryptedObject encryptedObject = new EncryptedObject.Builder(x)
          .setId(obj.getProperty("id"))
          .setData(Base64.getEncoder().encodeToString(nonceWithCipherText))
          .build();

      return super.put_(x, encryptedObject);
    } catch (Throwable t) {
      logger_.error("Error encrypting object", t);
      t.printStackTrace();
      return null;
    }
  }

  @Override
  public FObject find_(X x, Object id) {
    try {
      EncryptedObject encryptedObject = (EncryptedObject) super.find_(x, id);
      byte[] data = Base64.getDecoder().decode(encryptedObject.getData());

      final byte[] nonce = new byte[GCM_NONCE_LENGTH];
      final byte[] cipherText = new byte[data.length - GCM_NONCE_LENGTH];

      // copy nonce and ciphertext
      System.arraycopy(data, 0, nonce, 0, nonce.length);
      System.arraycopy(data, nonce.length, cipherText, 0, cipherText.length);

      // create cipher
      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding", "BC");
      GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, nonce);
      cipher.init(Cipher.DECRYPT_MODE, key_, spec);

      // decrypt ciphertext
      JSONParser parser = x.create(JSONParser.class);
      byte[] plaintext = new byte[cipher.getOutputSize(cipherText.length)];
      int updated = cipher.update(cipherText, 0, cipherText.length, plaintext, 0);
      cipher.doFinal(plaintext, updated);

      return parser.parseString(new String(plaintext, StandardCharsets.UTF_8));
    } catch (Throwable t) {
      logger_.error("Error decrypting object", t);
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
