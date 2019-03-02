package net.nanopay.iso8583.test;

public class ISONumericTest
  extends AbstractISOFieldTest
{
  public ISONumericTest() {
    super(new net.nanopay.iso8583.type.ISONumeric(6, "Should be 000123"));
  }

  @Override
  public void runTest(foam.core.X x) {
    Test_ISOFieldTest_Pack("123", new byte[] { '0', '0', '0', '1', '2', '3' }, "\"123\" is packed as [48, 48, 48, 49, 50, 51]");
    Test_ISOFieldTest_Unpack(new byte[] { '0', '0', '0', '1', '2', '3'}, "123", "[48, 48, 48, 49, 50, 51] is unpacked as \"123\"");
    Test_ISOFieldTest_Reversability("123",  "Unpacked data equals original data");
  }
}
