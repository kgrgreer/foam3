package net.nanopay.iso8583.prefixer;

/**
 * ASCIIPrefixer which prefixes ASCII strings with the lengthh
 */
public class ASCIIPrefixer
  implements Prefixer
{
  /**
   * Convenience prefixer for two digit length prefixing
   */
  public static final ASCIIPrefixer LL = new ASCIIPrefixer(2);

  /**
   * Convenience prefixer for three digit length prefixing
   */
  public static final ASCIIPrefixer LLL = new ASCIIPrefixer(3);

  protected final int digits_;

  private ASCIIPrefixer(int digits) {
    digits_ = digits;
  }

  @Override
  public void encodeLength(int length, java.io.OutputStream out)
    throws java.io.IOException
  {
    int pad = digits_ - countDigits(length);
    if ( pad < 0 ) {
      throw new IllegalArgumentException("Invalid length: " + length);
    }

    for (int i = 0; i < pad; i++) {
      out.write((byte) '0');
    }

    for (int place = (int) Math.log10(length); place >= 0; place--) {
      int base = (int) Math.pow(10, place);
      out.write((byte) ((length / base) + '0'));
      length %= base;
    }
  }

  @Override
  public int decodeLength(java.io.InputStream in)
    throws java.io.IOException
  {
    int length = 0;
    for ( int i = 0 ; i < digits_ ; i++ ) {
      length = length * 10 + in.read() - (byte) '0';
    }

    return length;
  }

  @Override
  public int getPackedLength() {
    return digits_;
  }

  /**
   * Counts the number of digits in an long value
   * @param value value to count digits of
   * @return number of digits in the value
   */
  private int countDigits(long value) {
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
