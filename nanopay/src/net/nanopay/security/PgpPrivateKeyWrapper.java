
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

  public static PGPPrivateKey findSecretKey(InputStream keyIn, char[] pass) 
    throws IOException, PGPException, NoSuchProviderException {
    
    PGPSecretKeyRingCollection pgpSec = new PGPSecretKeyRingCollection(
      org.bouncycastle.openpgp.PGPUtil.getDecoderStream(keyIn), new JcaKeyFingerprintCalculator());

    PGPSecretKey pgpSecKey = null;
    Iterator<PGPSecretKeyRing> rIt = pgpSec.getKeyRings();
    while ( pgpSecKey == null && rIt.hasNext() ) {
      PGPSecretKeyRing kRing = rIt.next();
      Iterator<PGPSecretKey> kIt = kRing.getSecretKeys();
      while ( pgpSecKey == null && kIt.hasNext() ) {
        PGPSecretKey k = kIt.next();
        if ( k.isMasterKey() ) {
          pgpSecKey = k;
        }
      }
    }

    if ( pgpSecKey == null ) {
      return null;
    }

    PBESecretKeyDecryptor a = new JcePBESecretKeyDecryptorBuilder(
      new JcaPGPDigestCalculatorProviderBuilder().setProvider("BC").build()).setProvider("BC").build(pass);

    return pgpSecKey.extractPrivateKey(a);
  }
}
