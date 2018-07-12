package net.nanopay.security;

import foam.core.FObject;
import foam.lib.json.OutputterMode;
import foam.util.SafetyUtil;
import org.bouncycastle.util.encoders.Hex;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.security.NoSuchAlgorithmException;

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


  protected synchronized void outputDigest() {
    // don't output digest if empty, reset digest
    if ( SafetyUtil.isEmpty(stringWriter_.toString()) ) {
      hashingWriter_.reset();
      return;
    }

    String algorithm = hashingWriter_.getAlgorithm();
    String digest = Hex.toHexString(hashingWriter_.digest());
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

  public byte[] digest() {
    return hashingWriter_.digest();
  }
}
