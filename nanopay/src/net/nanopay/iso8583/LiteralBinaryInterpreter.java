package net.nanopay.iso8583;

public class LiteralBinaryInterpreter
  implements BinaryInterpreter
{
  public static final LiteralBinaryInterpreter INSTANCE = new LiteralBinaryInterpreter();

  private LiteralBinaryInterpreter() {}

  @Override
  public void interpret(byte[] data, java.io.OutputStream out)
    throws java.io.IOException
  {
    out.write(data, 0, data.length);
  }
}
