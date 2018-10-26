package net.nanopay.iso8583.interpreter;

import static net.nanopay.iso8583.ISO8583Util.HEX_ASCII;

/**
 * ASCIIHexInterpreter which interprets incoming data as an ASCII Hex String
 */
public class ASCIIHexInterpreter
  extends AbstractBinaryInterpreter
{
  public static final ASCIIHexInterpreter INSTANCE = new ASCIIHexInterpreter();

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
