
package net.nanopay.security;

import java.io.IOException;
import java.security.PublicKey;

import org.bouncycastle.openpgp.PGPPublicKey;

public class PgpPublicKeyWrapper implements PublicKey {

  private final PGPPublicKey pgpKey;

  public PgpPublicKeyWrapper(final PGPPublicKey pgpKey) {
    this.pgpKey = pgpKey;
  }

  @Override
  public String getAlgorithm() {
    return "OpenPGP";
  }

  @Override
  public String getFormat() {
    return "RAW";
  }

  @Override
  public byte[] getEncoded() {
    try {
      return pgpKey.getEncoded();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
    
  public PGPPublicKey getPGPPublicKey() {
    return pgpKey;
  }     
}
