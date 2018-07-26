package net.nanopay.security;

import foam.core.ClassInfo;
import foam.core.X;
import foam.dao.*;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.security.Security;

public class HashingJDAO
  extends JDAO
{
  static {
    // load bouncy castle provider
    BouncyCastleProvider provider = new BouncyCastleProvider();
    if (Security.getProvider(provider.getName()) == null ) {
      Security.addProvider(provider);
    }
  }

  public HashingJDAO(X x, ClassInfo classInfo, String filename) {
    this(x, "SHA-256", false, false, new MapDAO(classInfo), filename);
  }

  public HashingJDAO(X x, String algorithm, ClassInfo classInfo, String filename) {
    this(x, algorithm, false, false, new MapDAO(classInfo), filename);
  }

  public HashingJDAO(X x, boolean rollDigests, ClassInfo classInfo, String filename) {
    this(x, "SHA-256", false, rollDigests, new MapDAO(classInfo), filename);
  }

  public HashingJDAO(X x, String algorithm, boolean digestRequired, boolean rollDigests, ClassInfo classInfo, String filename) {
    this(x, algorithm, digestRequired, rollDigests, new MapDAO(classInfo), filename);
  }

  public HashingJDAO(X x, DAO delegate, String filename) {
    this(x, "SHA-256", false, false, delegate, filename);
  }

  public HashingJDAO(X x, String algorithm, DAO delegate, String filename) {
    this(x, algorithm, false, false, delegate, filename);
  }

  public HashingJDAO(X x, boolean rollDigests, DAO delegate, String filename) {
    this(x, "SHA-256", false, rollDigests, delegate, filename);
  }

  public HashingJDAO(X x, String algorithm, boolean rollDigests, DAO delegate, String filename) {
    this(x, algorithm, false, rollDigests, delegate, filename);
  }

  public HashingJDAO(X x, String algorithm, boolean digestRequired, boolean rollDigests, DAO delegate, String filename) {
    setX(x);
    setOf(delegate.getOf());
    setDelegate(delegate);

    journal_ = new HashingJournal.Builder(getX())
      .setAlgorithm(algorithm)
      .setDigestRequired(digestRequired)
      .setRollDigests(rollDigests)
      .setDao(delegate)
      .setFilename(filename)
      .setCreateFile(true)
      .build();

    // create a composite journal of repo journal
    // and runtime journal and load them all
    new CompositeJournal.Builder(getX())
      .setDelegates(new Journal[]{
        new HashingJournal.Builder(getX())
          .setFilename(filename + ".0")
          .setAlgorithm(algorithm)
          .setDigestRequired(digestRequired)
          .setRollDigests(rollDigests)
          .build(),
        new HashingJournal.Builder(getX())
          .setFilename(filename)
          .setAlgorithm(algorithm)
          .setDigestRequired(digestRequired)
          .setRollDigests(rollDigests)
          .build()
      })
      .build().replay(delegate);
  }
}
