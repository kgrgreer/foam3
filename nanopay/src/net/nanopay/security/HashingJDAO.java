package net.nanopay.security;

import foam.core.ClassInfo;
import foam.core.X;
import foam.dao.*;

public class HashingJDAO
  extends JDAO
{
  public HashingJDAO(X x, ClassInfo classInfo, String filename) {
    this(x, "SHA-256", false, new MapDAO(classInfo), filename);
  }

  public HashingJDAO(X x, String algorithm, ClassInfo classInfo, String filename) {
    this(x, algorithm, false, new MapDAO(classInfo), filename);
  }

  public HashingJDAO(X x, boolean rollHashes, ClassInfo classInfo, String filename) {
    this(x, "SHA-256", rollHashes, new MapDAO(classInfo), filename);
  }

  public HashingJDAO(X x, String algorithm, boolean rollHashes, ClassInfo classInfo, String filename) {
    this(x, algorithm, rollHashes, new MapDAO(classInfo), filename);
  }

  public HashingJDAO(X x, DAO delegate, String filename) {
    this(x, "SHA-256", false, delegate, filename);
  }

  public HashingJDAO(X x, String algorithm, DAO delegate, String filename) {
    this(x, algorithm, false, delegate, filename);
  }

  public HashingJDAO(X x, boolean rollHashes, DAO delegate, String filename) {
    this(x, "SHA-256", rollHashes, delegate, filename);
  }

  public HashingJDAO(X x, String algorithm, boolean rollHashes, DAO delegate, String filename) {
    setX(x);
    setOf(delegate.getOf());
    setDelegate(delegate);

    journal_ = new HashingJournal.Builder(getX())
      .setAlgorithm(algorithm)
      .setRollHashes(rollHashes)
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
          .setRollHashes(rollHashes)
          .build(),
        new HashingJournal.Builder(getX())
          .setFilename(filename)
          .setAlgorithm(algorithm)
          .setRollHashes(rollHashes)
          .build()
      })
      .build().replay(delegate);
  }
}
