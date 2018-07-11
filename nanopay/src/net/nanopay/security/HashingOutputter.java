package net.nanopay.security;

import foam.core.FObject;
import foam.lib.json.OutputterMode;
import org.bouncycastle.util.encoders.Hex;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.security.NoSuchAlgorithmException;

public class HashingOutputter
  extends foam.lib.json.Outputter
{
  protected HashingWriter hashingWriter_ = null;

  public HashingOutputter(String algorithm, OutputterMode mode)
    throws NoSuchAlgorithmException
  {
    this(algorithm, null, mode);
  }

  public HashingOutputter(String algorithm, PrintWriter writer, OutputterMode mode)
    throws NoSuchAlgorithmException
  {
    if ( writer == null ) {
      stringWriter_ = new StringWriter();
      writer = new PrintWriter(stringWriter_);
    }

    this.mode_ = mode;
    this.writer_ = new HashingWriter(algorithm, writer);
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
