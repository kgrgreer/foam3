package net.nanopay.security;

import foam.util.SafetyUtil;
import org.bouncycastle.util.encoders.Hex;

import java.io.PrintWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class HashingWriter extends PrintWriter {

  protected MessageDigest md_;

  public HashingWriter(Writer out) throws NoSuchAlgorithmException {
    this("SHA-256", out);
  }

  public HashingWriter(String algorithm, Writer out) throws NoSuchAlgorithmException {
    super(out);
    md_ = MessageDigest.getInstance(algorithm);
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
  public synchronized PrintWriter append(CharSequence csq) {
    if ( csq != null && ! SafetyUtil.isEmpty(csq.toString()) ) {
      md_.update(StandardCharsets.UTF_8.encode(csq.toString()));
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
