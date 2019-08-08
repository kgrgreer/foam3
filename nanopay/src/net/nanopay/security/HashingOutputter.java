package net.nanopay.security;

import foam.core.FObject;
import foam.lib.StoragePropertyPredicate;
import foam.util.SafetyUtil;
import org.bouncycastle.util.encoders.Hex;

/**
 * HashingOutputter hashes all data that goes through it and appends the digest
 * to the end of the output
 */
public class HashingOutputter
  extends foam.lib.json.Outputter
{
  protected HashingWriter hashingWriter_ = null;
  protected HashingJournal hashingJournal_ = null;

  public HashingOutputter(foam.core.X x, HashingJournal hashingJournal)
    throws java.security.NoSuchAlgorithmException
  {
    super(x);
    setPropertyPredicate(new StoragePropertyPredicate());

    // set hashing journal
    this.hashingJournal_ = hashingJournal;

    // create writers
    stringWriter_ = new java.io.StringWriter();
    this.writer_ = new HashingWriter(hashingJournal_.getAlgorithm(),
      new java.io.PrintWriter(stringWriter_));
    this.hashingWriter_ = (HashingWriter) this.writer_;
  }

  @Override
  public synchronized String stringify(FObject obj) {
    super.stringify(obj);
    outputDigest();
    return stringWriter_.toString();
  }

  @Override
  public synchronized String stringifyDelta(FObject oldFObject, FObject newFObject) {
    super.stringifyDelta(oldFObject, newFObject);
    outputDigest();
    return stringWriter_.toString();
  }

  /**
   * Appends the output of the hash function
   */
  private synchronized void outputDigest() {
    // don't output digest if empty, reset digest
    if ( SafetyUtil.isEmpty(stringWriter_.toString()) ) {
      hashingWriter_.reset();
      return;
    }

    // calculate digest
    String algorithm = hashingJournal_.getAlgorithm();
    byte[] digest = hashingWriter_.digest();

    // hash digests
    if ( hashingJournal_.getRollDigests() && hashingJournal_.getPreviousDigest() != null ) {
      hashingWriter_.update(hashingJournal_.getPreviousDigest());
      hashingWriter_.update(digest);
      digest = hashingWriter_.digest();
    }

    // set previous digest and output journal
    hashingJournal_.setPreviousDigest(digest);
    stringWriter_.append(",{")
      .append(beforeKey_())
      .append("algorithm")
      .append(afterKey_())
      .append(":\"")
      .append(escape(algorithm))
      .append("\",")
      .append(beforeKey_())
      .append("digest")
      .append(afterKey_())
      .append(":\"")
      .append(Hex.toHexString(digest))
      .append("\"}");
  }
}
