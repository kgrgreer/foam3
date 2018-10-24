package net.nanopay.iso8583.interpreter;

/**
 * ASCIIHexInterpreter which interprets incoming data as an ASCII Hex String
 */
public class ASCIIHexInterpreter
  extends AbstractBinaryInterpreter
{
  public static final ASCIIHexInterpreter INSTANCE = new ASCIIHexInterpreter();

  /** 0-15 to ASCII hex digit lookup table. */
  private static final byte[] HEX_ASCII = new byte[] {
    0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
    0x38, 0x39, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46
  };

  private ASCIIHexInterpreter() {}

  @Override
  public void interpret(byte[] data, java.io.OutputStream out)
    throws java.io.IOException
  {
    for ( int i = 0 ; i < data.length ; i++ ) {
      out.write(HEX_ASCII[(data[i] & 0xF0) >> 4]);
      out.write(HEX_ASCII[(data[i] & 0x0F)]);
    }
  }

  @Override
  public byte[] uninterpret(int length, java.io.InputStream in)
    throws java.io.IOException
  {
    byte[] ret = new byte[length];
    int packedLength = getPackedLength(length);
    for ( int i = 0 ; i < packedLength ; i++ ) {
      int shift = i % 2 == 1 ? 0 : 4;
      ret[i >> 1] |= foam.util.SecurityUtil.HexToInt((char) in.read()) << shift;
    }

    return ret;
  }

  @Override
  public int getPackedLength(int units) {
    return units * 2;
  }
}
