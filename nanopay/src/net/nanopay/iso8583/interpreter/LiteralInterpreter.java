package net.nanopay.iso8583.interpreter;

/**
 * Interpreter that performs no conversion.
 */
public class LiteralInterpreter
  extends AbstractInterpreter
{
  public static final LiteralInterpreter INSTANCE = new LiteralInterpreter();

  private LiteralInterpreter() {}

  @Override
  public void interpret(String data, java.io.OutputStream out)
    throws java.io.IOException
  {
    byte[] raw = data.getBytes(java.nio.charset.StandardCharsets.ISO_8859_1);
    out.write(raw, 0, raw.length);
  }

  @Override
  public String uninterpret(int length, java.io.InputStream in)
    throws java.io.IOException
  {
    return new String(readBytes(in, getPackedLength(length)), 0, length, java.nio.charset.StandardCharsets.ISO_8859_1);
  }

  @Override
  public int getPackedLength(int chars) {
    return chars;
  }
}
