package net.nanopay.iso8583.test;

import foam.test.TestUtils;
import net.nanopay.iso8583.padder.RightPadder;

public class RightPadderTest
  extends foam.nanos.test.Test
{
  protected RightPadder padder = new RightPadder('0');

  @Override
  public void runTest(foam.core.X x) {
    test("123000".equals(padder.pad("123", 6)), "123 is padded to 123000");
    test("123".equals(padder.unpad("123000")), "123000 is unpadded to 123");
    test("123".equals(padder.pad("123", 3)), "123 is not padded");
    TestUtils.testThrows(() -> padder.pad("123456", 3), "Data too long", IllegalArgumentException.class);
  }
}
