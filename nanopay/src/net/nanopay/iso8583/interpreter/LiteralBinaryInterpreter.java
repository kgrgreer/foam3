package net.nanopay.iso8583.interpreter;

/**
 * BinaryInterpreter that performs no conversion.
 */
public class LiteralBinaryInterpreter
  extends AbstractBinaryInterpreter
{
  public static final LiteralBinaryInterpreter INSTANCE = new LiteralBinaryInterpreter();

  private LiteralBinaryInterpreter() {}

  @Override
  public void interpret(byte[] data, java.io.OutputStream out)
    throws java.io.IOException
  {
    out.write(data, 0, data.length);
  }

  @Override
  public byte[] uninterpret(int length, java.io.InputStream in)
    throws java.io.IOException
  {
    return readBytes(in, getPackedLength(length));
  }

  @Override
  public int getPackedLength(int bytes) {
    return bytes;
  }
}
