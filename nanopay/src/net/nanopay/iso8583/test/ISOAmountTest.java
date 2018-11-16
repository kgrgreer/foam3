package net.nanopay.iso8583.test;

public class ISOAmountTest
  extends AbstractISOFieldTest
{
  public ISOAmountTest() {
    super(new net.nanopay.iso8583.type.ISOAmount(6, "Should be D00123"));
  }

  @Override
  public void runTest(foam.core.X x) {
    Test_ISOFieldTest_Pack("D123", new byte[] { 'D', '0', '0', '1', '2', '3'}, "D123 is packed as [68, 48, 48, 49, 50, 51]");
    Test_ISOFieldTest_Unpack(new byte[] { 'D', '0', '0', '1', '2', '3'}, "D123", "[68, 48, 48, 49, 50, 51] is unpacked as D123");
    Test_ISOFieldTest_Reversability("D123",  "Unpacked data equals original data");
  }
}
