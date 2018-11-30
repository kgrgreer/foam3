package net.nanopay.security;

public class HashingWriter
  extends java.io.PrintWriter
{
  protected java.security.MessageDigest md_;

  public HashingWriter(java.io.Writer out)
    throws java.security.NoSuchAlgorithmException
  {
    this("SHA-256", out);
  }

  public HashingWriter(String algorithm, java.io.Writer out)
    throws java.security.NoSuchAlgorithmException
  {
    super(out);
    md_ = java.security.MessageDigest.getInstance(algorithm);
  }

  public String getAlgorithm() {
    return md_.getAlgorithm();
  }

  public synchronized void update(byte[] input) {
    md_.update(input);
  }

  public synchronized byte[] digest() {
    return md_.digest();
  }

  public synchronized void reset() {
    md_.reset();
  }

  @Override
  public synchronized java.io.PrintWriter append(CharSequence csq) {
    if ( csq != null && ! foam.util.SafetyUtil.isEmpty(csq.toString()) ) {
      md_.update(java.nio.charset.StandardCharsets.UTF_8.encode(csq.toString()));
      return super.append(csq);
    }
    return this;
  }

  @Override
  public synchronized void flush() {
    super.flush();
  }

  @Override
  public synchronized void close() {
    super.close();
  }
}
