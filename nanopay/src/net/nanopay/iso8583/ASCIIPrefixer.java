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
    int pad = digits_ - getDigits(length);
    System.out.println(pad);

    try {
      for (int i = 0; i < pad; i++) {
        out.write((byte) '0');
      }

      for (int place = (int) Math.log10(length); place >= 0; place--) {
        int base = (int) Math.pow(10, place);
        out.write((byte) ((length / base) + '0'));
        length %= base;
      }
    } catch ( Throwable t ) {
      t.printStackTrace();
    }
  }

  @Override
  public int decodeLength(byte[] b, int offset) {
    return 0;
  }

  private int getDigits(long value) {
    return value < 100000 ?
      value < 100 ?
        value < 10 ?
          1 : 2 :
        value < 1000 ?
          3 : value < 10000 ?
          4 : 5 :
      value < 10000000 ?
        value < 1000000 ?
          6 : 7 :
        value < 100000000 ?
          8 : value < 1000000000 ?
          9 : 10;
  }
}
