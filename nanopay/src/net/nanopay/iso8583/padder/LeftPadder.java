package net.nanopay.iso8583.padder;

/**
 * Pads characters to the left
 */
public class LeftPadder
  implements Padder
{
  /**
   * Convenience padder for Numeric types which pad 0's on the left.
   */
  public static final LeftPadder ZERO_PADDER = new LeftPadder('0');

  protected static final ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder sb = super.get();
      sb.setLength(0);
      return sb;
    }
  };

  protected final char pad_;

  public LeftPadder(char pad) {
    pad_ = pad;
  }

  @Override
  public String pad(String data, int maxLength) {
    int length = data.length();
    StringBuilder builder = sb.get();
    if ( length > maxLength ) {
      throw new IllegalArgumentException("Data too long");
    }

    for ( int i = maxLength - length ; i > 0 ; i-- ) {
      builder.append(pad_);
    }

    builder.append(data);
    return builder.toString();
  }

  @Override
  public String unpad(String data) {
    int i = 0;
    int length = data.length();
    while ( i < length ) {
      if ( data.charAt(i) != pad_ ) {
        return data.substring(i);
      }
      i++;
    }
    return "";
  }
}
