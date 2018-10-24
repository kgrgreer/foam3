package net.nanopay.iso8583.prefixer;

/**
 * Prefixer implementation which performs no prefixing
 */
public class NullPrefixer
  implements Prefixer
{
  public static final NullPrefixer INSTANCE = new NullPrefixer();

  private NullPrefixer() {}

  @Override
  public void encodeLength(int length, java.io.OutputStream out) {}

  @Override
  public int decodeLength(java.io.InputStream in) {
    return -1;
  }

  @Override
  public int getPackedLength() {
    return 0;
  }
}
