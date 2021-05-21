/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.security;

import java.security.Security;

import org.bouncycastle.jce.provider.BouncyCastleProvider;

import foam.core.ClassInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.java.JDAO;
import foam.nanos.fs.ResourceStorage;

public class HashingJDAO
  extends JDAO
{
  static {
    BouncyCastleProvider provider = new BouncyCastleProvider();
    if ( Security.getProvider(provider.getName()) == null ) {
      Security.addProvider(provider);
    }
  }

  public HashingJDAO(X x, ClassInfo classInfo, String filename) {
    this(x, "SHA-256", false, false, new MDAO(classInfo), filename);
  }

  public HashingJDAO(X x, String algorithm, ClassInfo classInfo, String filename) {
    this(x, algorithm, true, true, new MDAO(classInfo), filename);
  }

  public HashingJDAO(X x, boolean rollDigests, ClassInfo classInfo, String filename) {
    this(x, "SHA-256", true, rollDigests, new MDAO(classInfo), filename);
  }

  public HashingJDAO(X x, String algorithm, boolean digestRequired, boolean rollDigests, ClassInfo classInfo, String filename) {
    this(x, algorithm, digestRequired, rollDigests, new MDAO(classInfo), filename);
  }

  public HashingJDAO(X x, DAO delegate, String filename) {
    this(x, "SHA-256", true, true, delegate, filename);
  }

  public HashingJDAO(X x, String algorithm, DAO delegate, String filename) {
    this(x, algorithm, true, true, delegate, filename);
  }

  public HashingJDAO(X x, boolean rollDigests, DAO delegate, String filename) {
    this(x, "SHA-256", true, rollDigests, delegate, filename);
  }

  public HashingJDAO(X x, String algorithm, boolean rollDigests, DAO delegate, String filename) {
    this(x, algorithm, true, rollDigests, delegate, filename);
  }

  public HashingJDAO(X x, String algorithm, boolean digestRequired, boolean rollDigests, DAO delegate, String filename) {
    this(x, algorithm, digestRequired, rollDigests, delegate, filename, false);
  }

  public HashingJDAO(X x, String algorithm, boolean digestRequired, boolean rollDigests, DAO delegate, String filename, boolean cluster) {
    setX(x);
    setOf(delegate.getOf());
    setDelegate(delegate);

    X resourceStorageX = getX();
    if ( System.getProperty("resource.journals.dir") != null ) {
      resourceStorageX = x.put(foam.nanos.fs.Storage.class,
                               new ResourceStorage(System.getProperty("resource.journals.dir")));
    }

    // replay repo journal
    HashingJournal repo = new HashingJournal.Builder(resourceStorageX)
      .setFilename(filename + ".0")
      .setCreateFile(false)
      .setDigestRequired(false)
      .setMessageDigest(new MessageDigest.Builder(resourceStorageX)
                        .setAlgorithm(algorithm)
                        //.setProvider()
                        .setRollDigests(false)
                        .build())
      .build();
    repo.replay(x, delegate);

    if ( cluster ) {
      setJournal(new foam.dao.NullJournal.Builder(x).build());
    } else {
      // replay runtime journal
      setJournal(new HashingJournal.Builder(x)
                 .setDigestRequired(digestRequired)
                 .setDao(delegate)
                 .setFilename(filename)
                 .setCreateFile(true)
                 .setMessageDigest(new MessageDigest.Builder(x)
                                   .setAlgorithm(algorithm)
                                   //.setProvider()
                                   .setRollDigests(rollDigests)
                                   .build())
                 .build());
      getJournal().replay(x, delegate);
    }
  }
}
