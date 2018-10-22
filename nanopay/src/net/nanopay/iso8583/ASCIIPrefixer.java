package net.nanopay.iso8583;

import java.io.OutputStream;

public class ASCIIPrefixer
  implements Prefixer
{
  public static final ASCIIPrefixer LL = new ASCIIPrefixer(2);

  public static final ASCIIPrefixer LLL = new ASCIIPrefixer(3);

  protected final int digits_;

  private ASCIIPrefixer(int digits) {
    digits_ = digits;
  }

  @Override
  public void encodeLength(int length, OutputStream out) {
    try {
      if ( length >= 10 ) {
        encodeLength(length / 10, out);
      }

      out.write((byte)(length % 10 + '0'));
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public int decodeLength(byte[] b, int offset) {
    return 0;
  }
}
