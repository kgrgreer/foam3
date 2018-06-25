package net.nanopay.security.util;

import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.Security;

public class SecurityUtil {
  static {
    // add bouncy castle provider
    BouncyCastleProvider provider = new BouncyCastleProvider();
    if ( Security.getProvider(provider.getName()) == null ) {
      Security.addProvider(provider);
    }
  }

  private static SecureRandom srand_ = null;

  /**
   * Generates a SecureRandom using SHA1PRNG as the default algorithm
   *
   * @return secure random instance
   * @throws NoSuchAlgorithmException
   */
  public static SecureRandom GetSecureRandom() throws NoSuchAlgorithmException {
    return GetSecureRandom("SHA1PRNG");
  }

  /**
   * Generates a SecureRandom using a user provided algorithm
   *
   * @param algorithm secure random algorithm
   * @return secure random instance
   * @throws NoSuchAlgorithmException
   */
  public static SecureRandom GetSecureRandom(String algorithm) throws NoSuchAlgorithmException {
    if ( srand_ == null ) {
      srand_ = SecureRandom.getInstance(algorithm);
    }
    return srand_;
  }
}
