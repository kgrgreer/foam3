package net.nanopay.iso8583.padder;

/**
 * Pads characters to the left
 */
public class RightPadder
  implements Padder
{
  /**
   * Convenience padder for Alphanumeric types which pad spaces on the right.
   */
  public static final RightPadder SPACE_PADDER = new RightPadder(' ');

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

  public RightPadder(char pad) {
    pad_ = pad;
  }

  @Override
  public String pad(String data, int maxLength) {
    int length = data.length();
    StringBuilder builder = sb.get();
    if ( length > maxLength ) {
      throw new IllegalArgumentException("Data too long");
    }

    builder.append(data);
    for ( ; length < maxLength ; length++ ) {
      builder.append(pad_);
    }

    return builder.toString();
  }

  @Override
  public String unpad(String data) {
    int length = data.length();
    for ( int i = length ; i > 0 ; i-- ) {
      if ( data.charAt(i - 1) != pad_ ) {
        return data.substring(0, i);
      }
    }
    return "";
  }
}
