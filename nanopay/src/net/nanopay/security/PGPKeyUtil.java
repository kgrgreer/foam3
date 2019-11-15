package net.nanopay.security;

import foam.core.X;
import foam.dao.DAO;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.security.Security;
import java.util.Iterator;

import org.bouncycastle.bcpg.ArmoredOutputStream;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.openpgp.operator.jcajce.JcaKeyFingerprintCalculator;
import org.bouncycastle.openpgp.operator.jcajce.JcePBESecretKeyDecryptorBuilder;
import org.bouncycastle.openpgp.operator.jcajce.JcePGPDataEncryptorBuilder;
import org.bouncycastle.openpgp.operator.jcajce.JcaPGPDigestCalculatorProviderBuilder;
import org.bouncycastle.openpgp.operator.jcajce.JcePublicKeyDataDecryptorFactoryBuilder;
import org.bouncycastle.openpgp.operator.jcajce.JcePublicKeyKeyEncryptionMethodGenerator;
import org.bouncycastle.openpgp.operator.PublicKeyDataDecryptorFactory;
import org.bouncycastle.openpgp.operator.PBESecretKeyDecryptor;
import org.bouncycastle.openpgp.PGPCompressedData;
import org.bouncycastle.openpgp.PGPCompressedDataGenerator;
import org.bouncycastle.openpgp.PGPEncryptedData;
import org.bouncycastle.openpgp.PGPEncryptedDataGenerator;
import org.bouncycastle.openpgp.PGPEncryptedDataList;
import org.bouncycastle.openpgp.PGPException;
import org.bouncycastle.openpgp.PGPLiteralData;
import org.bouncycastle.openpgp.PGPObjectFactory;
import org.bouncycastle.openpgp.PGPOnePassSignatureList;
import org.bouncycastle.openpgp.PGPPrivateKey;
import org.bouncycastle.openpgp.PGPSecretKey;
import org.bouncycastle.openpgp.PGPSecretKeyRing;
import org.bouncycastle.openpgp.PGPSecretKeyRingCollection;
import org.bouncycastle.openpgp.operator.PBESecretKeyDecryptor;
import org.bouncycastle.openpgp.PGPPublicKey;
import org.bouncycastle.openpgp.PGPPublicKeyEncryptedData;
import org.bouncycastle.openpgp.PGPPublicKeyRing;
import org.bouncycastle.openpgp.PGPPublicKeyRingCollection;
import org.bouncycastle.openpgp.PGPSignatureGenerator;
import org.bouncycastle.openpgp.PGPSignatureList;

import static foam.mlang.MLang.EQ;

public class PGPKeyUtil {

  public static PGPPublicKey readPublicKey(InputStream in) throws IOException, PGPException {
    in = org.bouncycastle.openpgp.PGPUtil.getDecoderStream(in);
    PGPPublicKeyRingCollection pgpPub = new PGPPublicKeyRingCollection(in, new JcaKeyFingerprintCalculator());
    PGPPublicKey key = null;
    Iterator<PGPPublicKeyRing> rIt = pgpPub.getKeyRings();
    while (key == null && rIt.hasNext()) {
      PGPPublicKeyRing kRing = rIt.next();
      Iterator<PGPPublicKey> kIt = kRing.getPublicKeys();
      while (key == null && kIt.hasNext()) {
        PGPPublicKey k = kIt.next();
        if (k.isEncryptionKey()) {
          key = k;
        }
      }
    }

    if (key == null) {
      throw new IllegalArgumentException("Can't find encryption key in key ring.");
    }

    return key;
  }

  public static PGPPublicKey publicKeyParse(byte[] publicKeyBytes) throws IOException {
    InputStream pgpIn = org.bouncycastle.openpgp.PGPUtil.getDecoderStream(new ByteArrayInputStream(publicKeyBytes));
    PGPObjectFactory pgpFact = new PGPObjectFactory(pgpIn, new JcaKeyFingerprintCalculator());
    Iterator<Object> pgpFactIt = pgpFact.iterator();
    while ( pgpFactIt.hasNext() ) {
      Object o = pgpFactIt.next();
      if ( o instanceof PGPPublicKey ) return (PGPPublicKey) o;

      if ( o instanceof PGPPublicKeyRing ) {
        PGPPublicKeyRing kRing = (PGPPublicKeyRing) o;
        Iterator<PGPPublicKey> kIt = kRing.getPublicKeys();
        while (kIt.hasNext()) {
          PGPPublicKey k = kIt.next();
          if (k.isEncryptionKey()) {
            return k;
          }
        }
      }
    }
    return null;
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

  public static void encryptFile(X x, File file, String keyAlias, OutputStream out) throws IOException, 
    NoSuchProviderException, PGPException {
    PublicKeyEntry pubKey = (PublicKeyEntry) ((DAO) x.get("publicKeyDAO")).find(EQ(PublicKeyEntry.ALIAS, keyAlias)); 
    if ( pubKey == null ) throw new RuntimeException("Public Key not found with alias: " + keyAlias); 
    pubKey = (PublicKeyEntry) ((DAO) x.get("publicKeyDAO")).find(pubKey.getId()); 
    if ( ! (pubKey.getPublicKey() instanceof PgpPublicKeyWrapper) ) throw new RuntimeException("Public Key is not a PGP Key: " + keyAlias);
    PgpPublicKeyWrapper pgpPubKey = (PgpPublicKeyWrapper) pubKey.getPublicKey();
    PGPPublicKey encKey = pgpPubKey.getPGPPublicKey();

    // add provider only if it's not in the JVM
    if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
      Security.addProvider(new BouncyCastleProvider());
    }
    
    ByteArrayOutputStream bOut = new ByteArrayOutputStream();
    PGPCompressedDataGenerator comData = new PGPCompressedDataGenerator(PGPCompressedData.ZIP);
    org.bouncycastle.openpgp.PGPUtil.writeFileToLiteralData(comData.open(bOut), PGPLiteralData.BINARY, file);
    comData.close();

    JcePGPDataEncryptorBuilder c = new JcePGPDataEncryptorBuilder(PGPEncryptedData.CAST5)
      .setWithIntegrityPacket(true).setSecureRandom(new SecureRandom()).setProvider("BC");
    PGPEncryptedDataGenerator cPk = new PGPEncryptedDataGenerator(c);
    JcePublicKeyKeyEncryptionMethodGenerator d = new JcePublicKeyKeyEncryptionMethodGenerator(encKey)
      .setProvider(new BouncyCastleProvider()).setSecureRandom(new SecureRandom());
    cPk.addMethod(d);
    byte[] bytes = bOut.toByteArray();
    out = new ArmoredOutputStream(out);
    OutputStream cOut = cPk.open(out, bytes.length);
    cOut.write(bytes);
    cOut.close();
    out.close();
  }
  
  public static void decryptFile(X x, InputStream in, OutputStream out, String keyAlias) throws Exception {
    DAO keyPairDAO = (DAO) x.get("keyPairDAO");
    KeyPairEntry keyPair = (KeyPairEntry) keyPairDAO.find(foam.mlang.MLang.EQ(KeyPairEntry.ALIAS, keyAlias));
    if ( keyPair == null ) throw new RuntimeException("Key Pair not found with alias: " + keyAlias); 
    PrivateKeyEntry privateKeyEntry = (PrivateKeyEntry) ((DAO) x.get("privateKeyDAO")).find(keyPair.getPrivateKeyId());
    if ( ! (privateKeyEntry.getPrivateKey() instanceof PgpPrivateKeyWrapper) ) throw new RuntimeException("Private Key is not a PGP Key: " + keyAlias);
    PgpPrivateKeyWrapper pgpPrivateKey = (PgpPrivateKeyWrapper) privateKeyEntry.getPrivateKey();
    PGPPrivateKey decKey = pgpPrivateKey.getPGPPrivateKey();
    if ( decKey == null ) throw new RuntimeException("PGP Private Key not found: " + keyAlias); 

    // add provider only if it's not in the JVM
    if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
      Security.addProvider(new BouncyCastleProvider());
    }

    in = org.bouncycastle.openpgp.PGPUtil.getDecoderStream(in);
    PGPObjectFactory pgpF = new PGPObjectFactory(in, new JcaKeyFingerprintCalculator());
		PGPEncryptedDataList enc = null;
    Iterator<Object> oIt = pgpF.iterator();
    while ( enc == null && oIt.hasNext() ) {
      Object o = oIt.next();
      if (o instanceof  PGPEncryptedDataList) {
        enc = (PGPEncryptedDataList) o;
      } 
    }
		//
		// the first object might be a PGP marker packet.
		//
    
    PublicKeyDataDecryptorFactory b = new JcePublicKeyDataDecryptorFactoryBuilder().setProvider("BC").setContentProvider("BC").build(decKey);
    Iterator<PGPPublicKeyEncryptedData> it = enc.getEncryptedDataObjects();
    PGPPublicKeyEncryptedData pbe = null;
    while (it.hasNext()) {
			pbe = it.next();
      if ( pbe != null && pbe.getKeyID() == decKey.getKeyID() ) break;
		}
		InputStream clear = pbe.getDataStream(b);
		PGPObjectFactory plainFact = new PGPObjectFactory(clear, new JcaKeyFingerprintCalculator());
		Object message = plainFact.nextObject();
		if (message instanceof  PGPCompressedData) {
			PGPCompressedData cData = (PGPCompressedData) message;
			PGPObjectFactory pgpFact = new PGPObjectFactory(cData.getDataStream(), new JcaKeyFingerprintCalculator());
			message = pgpFact.nextObject();
		}

		if (message instanceof  PGPLiteralData) {
			PGPLiteralData ld = (PGPLiteralData) message;
			InputStream unc = ld.getInputStream();
			int ch;
			while ((ch = unc.read()) >= 0) {
				out.write(ch);
			}
		} else if (message instanceof  PGPOnePassSignatureList) {
			throw new PGPException("Encrypted message contains a signed message - not literal data.");
		} else {
			throw new PGPException("Message is not a simple encrypted file - type unknown.");
		}

		if (pbe.isIntegrityProtected()) {
			if (!pbe.verify()) {
				throw new PGPException("Message failed integrity check");
			}
		}
	}

}