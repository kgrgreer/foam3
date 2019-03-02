package net.nanopay.iso8583.test;

import net.nanopay.iso8583.padder.TruncatingRightPadder;

public class TruncatingRightPadderTest
  extends foam.nanos.test.Test
{
  protected TruncatingRightPadder padder = new TruncatingRightPadder('0');

  @Override
  public void runTest(foam.core.X x) {
    test("123000".equals(padder.pad("123", 6)), "123 is padded to 123000");
    test("123".equals(padder.unpad("123000")), "123000 is unpadded to 123");
    test("123".equals(padder.pad("123", 3)), "123 is not padded");
    test("123".equals(padder.pad("123456", 3)), "123456 is truncated to 123");
  }
}
