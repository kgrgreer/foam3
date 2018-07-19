package net.nanopay.security;

import foam.core.FObject;
import foam.lib.json.OutputterMode;
import foam.util.SafetyUtil;
import org.bouncycastle.util.encoders.Hex;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.security.NoSuchAlgorithmException;

/**
 * This Outputter hashes all data that goes through it and appends the digest
 * to the end of the output
 */
public class HashingOutputter
  extends foam.lib.json.Outputter
{
  protected HashingWriter hashingWriter_ = null;
  protected HashingJournal hashingJournal_ = null;

  public HashingOutputter(HashingJournal hashingJournal, OutputterMode mode)
    throws NoSuchAlgorithmException
  {
    // set mode and hashing journal
    this.mode_ = mode;
    this.hashingJournal_ = hashingJournal;

    // create writers
    stringWriter_ = new StringWriter();
    this.writer_ = new HashingWriter(hashingJournal_.getAlgorithm(),
      new PrintWriter(stringWriter_));
    this.hashingWriter_ = (HashingWriter) this.writer_;
  }

  @Override
  public synchronized String stringify(FObject obj) {
    rollDigests();
    super.stringify(obj);
    outputDigest();
    return stringWriter_.toString();
  }

  @Override
  public synchronized String stringifyDelta(FObject oldFObject, FObject newFObject) {
    rollDigests();
    super.stringifyDelta(oldFObject, newFObject);
    outputDigest();
    return stringWriter_.toString();
  }

  /**
   * Updates the hash function with the previously stored digest
   */
  private synchronized void rollDigests() {
    if ( hashingJournal_.getRollDigests() && ! SafetyUtil.isEmpty(hashingJournal_.getPreviousDigest()) ) {
      hashingWriter_.update(Hex.decode(hashingJournal_.getPreviousDigest()));
    }
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

    String algorithm = hashingWriter_.getAlgorithm();
    String digest = Hex.toHexString(hashingWriter_.digest());
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
      .append(digest)
      .append("\"}");
  }
}
