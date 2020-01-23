package net.nanopay.security;

import foam.util.SecurityUtil;

import java.io.IOException;
import java.security.PrivateKey;

/**
 * This class is a decorator around BufferedWriter which enables a generation of
 * a signature using all of the data that is passed through it.
 *
 * @author Dhiren Audich
 */
public class SigningWriter
  extends java.io.BufferedWriter
{
  protected java.security.Signature sig_;
  protected String lineSeparator_;

  /**
   * Constructor which sets the default algorithm to SHA256withRSA provided the
   * private key and outputting writer.
   *
   * @param key Private key used to sign the signature with.
   * @param out Writer to write the data.
   * @throws java.security.NoSuchAlgorithmException
   * @throws java.security.InvalidKeyException
   */
  public SigningWriter(PrivateKey key, java.io.Writer out)
    throws java.security.NoSuchAlgorithmException, java.security.InvalidKeyException
  {
    this("SHA256withRSA", key, out);
  }

  /**
   * Constructor which sets the algorithm to the provided along with the private
   * key and the outputting writer.
   *
   * @param algorithm Algorithm to be used for singing.
   * @param key       Private key used to encrypt the signature with.
   * @param out       Outputting writer where the data is being written to.
   * @throws java.security.NoSuchAlgorithmException
   * @throws java.security.InvalidKeyException
   */
  public SigningWriter(String algorithm, PrivateKey key, java.io.Writer out)
    throws java.security.NoSuchAlgorithmException, java.security.InvalidKeyException
  {
    super(out);
    sig_ = java.security.Signature.getInstance(algorithm);
    sig_.initSign(key, SecurityUtil.GetSecureRandom());
    lineSeparator_ = System.lineSeparator();
  }

  /**
   * This method returns the name of the algorithm that the signature is using.
   *
   * @return THe name of the signature's generating algorithm.
   */
  public String getAlgorithm() {
    return sig_.getAlgorithm();
  }

  /**
   * This method updates the signature with the new data.
   *
   * @param input Byte array of the data to be signed.
   * @throws java.security.SignatureException
   */
  public synchronized void update(byte[] input)
    throws java.security.SignatureException {
    sig_.update(input);
  }

  /**
   * This method returns the generated signature.
   *
   * @return Generated signature.
   * @throws java.security.SignatureException
   */
  public synchronized byte[] sign()
    throws java.security.SignatureException {
    return sig_.sign();
  }

  /**
   * This method takes an input string, converts it to a byte array, updates the
   * signature and then passes off the string to the writer to write to disk.
   *
   * @param str New string to be added to the signature.
   * @throws IOException
   */
  @Override
  public synchronized void write(String str)
    throws IOException {
      if ( foam.util.SafetyUtil.isEmpty(str) ) {
        try {
          sig_.update(java.nio.charset.StandardCharsets.UTF_8.encode(str));
        } catch ( java.security.SignatureException s) {
          System.err.println("SigningWriter :: The signature could not be updated! " + s);
          throw new RuntimeException(s);
        }
        super.write(str);
      }
  }

  /**
   * This method appends a system specific newline character to the writer as
   * well as updating the signature.
   *
   * @throws IOException
   */
  @Override
  public synchronized void newLine()
    throws IOException {
    try {
      sig_.update(java.nio.charset.StandardCharsets.UTF_8.encode(lineSeparator_));
    } catch ( java.security.SignatureException s) {
      System.err.println("SigningWriter :: The signature could not be updated! " + s);
      throw new RuntimeException(s);
    }
    super.write(lineSeparator_);
  }

  /**
   * This method flushes the writer's buffer.
   *
   * @throws IOException
   */
  @Override
  public synchronized void flush()
    throws IOException {
    super.flush();
  }

  /**
   * This method closes the buffered writer stream.
   *
   * @throws IOException
   */
  @Override
  public synchronized void close()
    throws IOException {
    super.close();
  }
}
