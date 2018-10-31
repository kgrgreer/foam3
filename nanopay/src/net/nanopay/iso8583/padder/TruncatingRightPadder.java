package net.nanopay.iso8583.padder;

/**
 * Padder which truncates data that is too long
 */
public class TruncatingRightPadder
  extends RightPadder
{
  /**
   * Convenience padder for Alphanumeric types which pad spaces on the right.
   */
  public static final TruncatingRightPadder SPACE_PADDER = new TruncatingRightPadder(' ');

  public TruncatingRightPadder(char pad) {
    super(pad);
  }

  @Override
  public String pad(String data, int maxLength) {
    return data.length() > maxLength ?
      super.pad(data.substring(0, maxLength), maxLength) :
      super.pad(data, maxLength);
  }
}
