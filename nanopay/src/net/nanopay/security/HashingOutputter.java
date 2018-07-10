package net.nanopay.security;

import foam.lib.json.OutputterMode;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.security.NoSuchAlgorithmException;

public class HashingOutputter
  extends foam.lib.json.Outputter
{
  protected HashingWriter hashingWriter_ = null;

  public HashingOutputter(String algorithm)
    throws NoSuchAlgorithmException
  {
    this(algorithm, OutputterMode.FULL);
  }

  public HashingOutputter(String algorithm, OutputterMode mode)
    throws NoSuchAlgorithmException
  {
    this(algorithm, (PrintWriter) null, mode);
  }

  public HashingOutputter(String algorithm, File file, OutputterMode mode)
    throws FileNotFoundException, NoSuchAlgorithmException
  {
    this(algorithm, new PrintWriter(file), mode);
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

  public byte[] digest() {
    return hashingWriter_.digest();
  }
}
