package net.nanopay.security;

import foam.util.SecurityUtil;

import java.io.IOException;
import java.security.PrivateKey;
import java.security.SignatureException;

public class SigningWriter
  extends java.io.BufferedWriter
{
  protected java.security.Signature sig_;
  protected String lineSeparator_;

  public SigningWriter(PrivateKey key, java.io.Writer out)
    throws java.security.NoSuchAlgorithmException, java.security.InvalidKeyException
  {
    this("SHA256withRSA", key, out);
  }

  public SigningWriter(String algorithm, PrivateKey key, java.io.Writer out)
    throws java.security.NoSuchAlgorithmException, java.security.InvalidKeyException
  {
    super(out);
    sig_ = java.security.Signature.getInstance(algorithm);
    sig_.initSign(key, SecurityUtil.GetSecureRandom());
    lineSeparator_ = java.security.AccessController.doPrivileged(
      new sun.security.action.GetPropertyAction("line.separator"));
  }

  public String getAlgorithm() {
    return sig_.getAlgorithm();
  }

  public synchronized void update(byte[] input)
    throws java.security.SignatureException {
    sig_.update(input);
  }

  public synchronized byte[] sign()
    throws java.security.SignatureException {
    return sig_.sign();
  }

  @Override
  public synchronized void write(String str)
    throws IOException {
      if ( str != null && ! foam.util.SafetyUtil.isEmpty(str) ) {
        try {
          sig_.update(java.nio.charset.StandardCharsets.UTF_8.encode(str));
        } catch ( java.security.SignatureException s) {
          System.err.println("SigningWriter :: The signature could not be updated! " + s);
          new RuntimeException(s);
        }
        super.write(str);
      }
  }

  @Override
  public synchronized void newLine()
    throws IOException {
    try {
      sig_.update(java.nio.charset.StandardCharsets.UTF_8.encode(lineSeparator_));
    } catch ( java.security.SignatureException s) {
      System.err.println("SigningWriter :: The signature could not be updated! " + s);
      new RuntimeException(s);
    }
    super.write(lineSeparator_);
  }

  @Override
  public synchronized void flush()
    throws IOException {
    super.flush();
  }

  @Override
  public synchronized void close()
    throws IOException {
    super.close();
  }
}
