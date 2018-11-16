package net.nanopay.iso8583.test;

import foam.test.TestUtils;
import net.nanopay.iso8583.padder.LeftPadder;

public class LeftPadderTest
  extends foam.nanos.test.Test
{
  protected LeftPadder padder = new LeftPadder('0');

  @Override
  public void runTest(foam.core.X x) {
    test("000123".equals(padder.pad("123", 6)), "123 is padded to 000123");
    test("123".equals(padder.unpad("000123")), "000123 is unpadded to 123");
    test("123".equals(padder.pad("123", 3)), "123 is not padded");
    TestUtils.testThrows(() -> padder.pad("123456", 3), "Data too long", IllegalArgumentException.class);
  }
}
