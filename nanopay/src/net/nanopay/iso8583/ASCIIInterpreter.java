package net.nanopay.iso8583;

public class ASCIIInterpreter
  implements Interpreter
{
  public static final ASCIIInterpreter INSTANCE = new ASCIIInterpreter();

  private ASCIIInterpreter() {}

  @Override
  public void interpret(String data, java.io.OutputStream out)
    throws java.io.IOException
  {
    out.write(data.getBytes(java.nio.charset.StandardCharsets.ISO_8859_1), 0, data.length());
  }
}
