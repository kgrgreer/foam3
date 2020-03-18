
package net.nanopay.security;

import java.io.InputStream;
import java.io.IOException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
import java.util.Iterator;

import org.bouncycastle.openpgp.PGPException;
import org.bouncycastle.openpgp.PGPPrivateKey;
import org.bouncycastle.openpgp.PGPSecretKey;
import org.bouncycastle.openpgp.PGPSecretKeyRing;
import org.bouncycastle.openpgp.PGPSecretKeyRingCollection;
import org.bouncycastle.openpgp.operator.PBESecretKeyDecryptor;
import org.bouncycastle.openpgp.operator.jcajce.JcaKeyFingerprintCalculator;
import org.bouncycastle.openpgp.operator.jcajce.JcaPGPDigestCalculatorProviderBuilder;
import org.bouncycastle.openpgp.operator.jcajce.JcePBESecretKeyDecryptorBuilder;

public class PgpPrivateKeyWrapper implements PrivateKey {
    
  private final PGPPrivateKey pgpKey;

  public PgpPrivateKeyWrapper(final PGPPrivateKey pgpKey) {
    this.pgpKey = pgpKey;
  }
  
  @Override
  public String getAlgorithm() {
    return "OpenPGP";
  }

  @Override
  public String getFormat() {
    return pgpKey.getPrivateKeyDataPacket().getFormat();
  }
  
  @Override
  public byte[] getEncoded() {
    return pgpKey.getPrivateKeyDataPacket().getEncoded();
  }

  public PGPPrivateKey getPGPPrivateKey() {
    return pgpKey;
  }

}
