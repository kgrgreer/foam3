package net.nanopay.kotak;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.Random;

public class KotakEncryption {
  private static final String ALGORITHM = "AES/CBC/PKCS5Padding";

  public static String encrypt(String message, String key) throws GeneralSecurityException {

    if( message == null || key == null ){
      throw new IllegalArgumentException("text to be encrypted and key should not be null");
    }

    Cipher cipher = Cipher.getInstance(ALGORITHM);
    byte[] messageArr = message.getBytes();

    SecretKeySpec keySpec = new SecretKeySpec(Base64.getDecoder().decode(key), "AES");

    byte[] ivParams = new byte[16];
    new Random().nextBytes(ivParams);
    byte[] encoded = new byte[messageArr.length + 16];

    System.arraycopy(ivParams,0,encoded,0,16);
    System.arraycopy(messageArr, 0, encoded, 16, messageArr.length);

    cipher.init(Cipher.ENCRYPT_MODE, keySpec, new IvParameterSpec(ivParams));

    byte[] encryptedBytes = cipher.doFinal(encoded);

    encryptedBytes = Base64.getEncoder().encode(encryptedBytes);

    return new String(encryptedBytes);
  }

  public static String decrypt(String encryptedStr, String key) throws GeneralSecurityException {
    if( encryptedStr == null || key == null ){
      throw new IllegalArgumentException("text to be decrypted and key should not be null");
    }

    Cipher cipher = Cipher.getInstance(ALGORITHM);

    SecretKeySpec keySpec = new SecretKeySpec(Base64.getDecoder().decode(key), "AES");

    byte[] encoded = encryptedStr.getBytes();
    encoded = Base64.getDecoder().decode(encoded);

    byte[] decodedEncrypted = new byte[encoded.length-16];
    System.arraycopy(encoded, 16, decodedEncrypted, 0,encoded.length-16);

    byte[] ivParams = new byte[16];
    new Random().nextBytes(ivParams);
    System.arraycopy(encoded,0, ivParams,0, ivParams.length);

    cipher.init(Cipher.DECRYPT_MODE, keySpec, new IvParameterSpec(ivParams));

    byte[] decryptedBytes = cipher.doFinal(decodedEncrypted);

    return new String(decryptedBytes);
  }
}
