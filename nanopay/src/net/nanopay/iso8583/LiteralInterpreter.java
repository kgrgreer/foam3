package net.nanopay.iso8583;

public class LiteralInterpreter
  implements Interpreter
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
}
