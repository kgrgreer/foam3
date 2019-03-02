package net.nanopay.iso8583.interpreter;

import java.nio.charset.StandardCharsets;

/**
 * ASCIIInterpreter which interprets incoming data as an ASCII String
 */
public class ASCIIInterpreter
  extends AbstractInterpreter
{
  public static final ASCIIInterpreter INSTANCE = new ASCIIInterpreter();

  private ASCIIInterpreter() {}

  @Override
  public void interpret(String data, java.io.OutputStream out)
    throws java.io.IOException
  {
    out.write(data.getBytes(StandardCharsets.ISO_8859_1), 0, data.length());
  }

  @Override
  public String uninterpret(int length, java.io.InputStream in)
    throws java.io.IOException
  {
    byte[] ret = new byte[length];
    System.arraycopy(readBytes(in, getPackedLength(length)), 0, ret, 0, length);
    return new String(ret, java.nio.charset.StandardCharsets.ISO_8859_1);
  }

  @Override
  public int getPackedLength(int chars) {
    return chars;
  }
}
