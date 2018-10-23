package net.nanopay.iso8583;

public class FixedBitSet
  extends java.util.BitSet
{

  protected final int bits_;

  public FixedBitSet(final int bits) {
    super(bits);
    bits_ = bits;
  }

  public int getBits() {
    return bits_;
  }
}
