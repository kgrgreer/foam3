package net.nanopay.security;

import foam.core.ClassInfo;
import foam.core.X;
import foam.dao.*;
import foam.dao.java.JDAO;

public class SigningJDAO
  extends JDAO
{
  public SigningJDAO(X x, ClassInfo classInfo, String filename) {
    this(x, "SHA256withRSA", new MapDAO(classInfo), filename);
  }

  public SigningJDAO(X x, String algorithm, ClassInfo classInfo, String filename) {
    this(x, algorithm, new MapDAO(classInfo), filename);
  }

  public SigningJDAO(X x, DAO delegate, String filename) {
    this(x, "SHA256withRSA", delegate, filename);
  }

  public SigningJDAO(X x, String algorithm, DAO delegate, String filename) {
    setX(x);
    setOf(delegate.getOf());
    setDelegate(delegate);

    journal_ = new SigningJournal.Builder(getX())
      .setAlgorithm(algorithm)
      .setDao(delegate)
      .setFilename(filename)
      .setCreateFile(true)
      .build();

    // create a composite journal of repo journal
    // and runtime journal and load them all
    new CompositeJournal.Builder(getX())
      .setDelegates(new Journal[]{
        new SigningJournal.Builder(getX())
          .setFilename(filename + ".0")
          .setAlgorithm(algorithm)
          .build(),
        new SigningJournal.Builder(getX())
          .setFilename(filename)
          .setAlgorithm(algorithm)
          .build()
      })
      .build().replay(delegate);
  }
}
