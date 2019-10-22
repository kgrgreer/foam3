package net.nanopay.security;

import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;

import org.bouncycastle.openpgp.PGPException;
import org.bouncycastle.openpgp.PGPPublicKey;
import org.bouncycastle.openpgp.PGPPublicKeyRing;
import org.bouncycastle.openpgp.PGPPublicKeyRingCollection;
import org.bouncycastle.openpgp.operator.jcajce.JcaKeyFingerprintCalculator;

public class PGPKeyUtil {

  public static PGPPublicKey readPublicKey(InputStream in) throws IOException, PGPException {
    in = org.bouncycastle.openpgp.PGPUtil.getDecoderStream(in);
    PGPPublicKeyRingCollection pgpPub = new PGPPublicKeyRingCollection(in, new JcaKeyFingerprintCalculator());
    PGPPublicKey key = null;
    Iterator<PGPPublicKeyRing> rIt = pgpPub.getKeyRings();
    while ( key == null && rIt.hasNext() ) {
      PGPPublicKeyRing kRing = rIt.next();
      Iterator<PGPPublicKey> kIt = kRing.getPublicKeys();
      while ( key == null && kIt.hasNext() ) {
        PGPPublicKey k = kIt.next();
        if ( k.isEncryptionKey() ) {
          key = k;
        }
      }
    }

    if ( key == null ) {
      throw new IllegalArgumentException("Can't find encryption key in key ring.");
    }

    return key;
  }
}