package net.nanopay.iso8583.test;

import net.nanopay.iso8583.padder.NullPadder;

public class NullPadderTest
  extends foam.nanos.test.Test
{
  protected NullPadder padder = NullPadder.INSTANCE;

  @Override
  public void runTest(foam.core.X x) {
    test("123".equals(padder.pad("123", 6)), "123 is not padded");
  }
}
