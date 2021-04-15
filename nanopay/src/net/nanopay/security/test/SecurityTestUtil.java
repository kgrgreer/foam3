package net.nanopay.security.test;

import foam.core.X;
import foam.core.XFactory;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import net.nanopay.security.KeyStoreManager;
import net.nanopay.security.PKCS12KeyStoreManager;

import java.nio.charset.StandardCharsets;
import org.apache.commons.io.IOUtils;

class SecurityTestUtil {

  /**
   * Check to see if SoftHSM is installed on the system
   * @return true if SoftHSM is installed, false otherwise
   */
  static boolean IsSoftHSMInstalled() {
    try {
      return new ProcessBuilder("softhsm2-util", "--help").start().waitFor() == 0;
    } catch ( Throwable t ) {
      return false;
    }
  }

  /**
   * Resets the SoftHSM token for future usage
   * @return true if successfully reset, false otherwise
   */
  static String ResetSoftHSM() {
    try {
      // delete existing test token, ignoring errors
      new ProcessBuilder("softhsm2-util",
        "--delete-token", "--token", "SecurityTestUtil")
        .inheritIO().start().waitFor();
    } catch ( Throwable t ) {
    }

    try {
      // create new test token
      Process process = new ProcessBuilder("softhsm2-util",
        "--init-token", "--free",
        "--label", "SecurityTestUtil",
        "--so-pin", "test",
        "--pin", "test")
        // .inheritIO()
        .start();

      // wait for process to finish
      if ( process.waitFor() != 0 ) {
        throw new RuntimeException("Failed to initialize token: \"SecurityTestUtil\"");
      }

      String output = IOUtils.toString(process.getInputStream(), StandardCharsets.UTF_8);
      return output.substring(output.lastIndexOf(" ")+1);
    } catch ( Throwable t ) {
      return null;
    }
  }

  /**
   * Creates a test context with test key store manager
   * @param x context to modify
   * @return updated context
   */
  static X CreateSecurityTestContext(X x) {
    return CreateSecurityTestContext(x, new PKCS12KeyStoreManager.Builder(x)
      .setKeyStorePath(System.getProperty("NANOPAY_HOME") + "/var/keys/keystore.p12")
      .setPassphrasePath(System.getProperty("NANOPAY_HOME") + "/var/keys/passphrase")
      .build());
  }


  static X CreateSecurityTestContext(X x, KeyStoreManager manager) {
    x = x.putFactory("keyStoreManager", new XFactory() {
      @Override
      public Object create(X x) {
        try {
          manager.unlock();
          return manager;
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      }
    });

    // replace private key dao context with new one
    DAO privateKeyDAO = (DAO) x.get("privateKeyDAO");
    ((foam.core.ContextAware) privateKeyDAO).setX(x);
    x = x.put("privateKeyDAO", privateKeyDAO);

    // replace public key dao context with new one
    DAO publicKeyDAO = (DAO) x.get("publicKeyDAO");
    ((foam.core.ContextAware) publicKeyDAO).setX(x);
    x = x.put("publicKeyDAO", publicKeyDAO);

    // replace key pair dao context with new one
    DAO keyPairDAO = (DAO) x.get("keyPairDAO");
    ((foam.core.ContextAware) keyPairDAO).setX(x);
    x = x.put("keyPairDAO", keyPairDAO);

    // return updated context
    return x;
  }
}
