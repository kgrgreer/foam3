package net.nanopay.iso8583;

import java.io.OutputStream;

public class NullPrefixer
  implements Prefixer
{
  public static final NullPrefixer INSTANCE = new NullPrefixer();

  private NullPrefixer() {}

  @Override
  public void encodeLength(int length, OutputStream out) {

  }

  @Override
  public int decodeLength(byte[] b, int offset) {
    return -1;
  }
}
