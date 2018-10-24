package net.nanopay.iso8583.padder;

public class NullPadder
  implements Padder
{
  public static final NullPadder INSTANCE = new NullPadder();

  private NullPadder() {}

  @Override
  public String pad(String data, int maxLength) {
    return data;
  }
}
