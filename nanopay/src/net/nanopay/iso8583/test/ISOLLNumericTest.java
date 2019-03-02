package net.nanopay.iso8583.test;

public class ISOLLNumericTest
  extends AbstractISOFieldTest
{
  public ISOLLNumericTest() {
    super(new net.nanopay.iso8583.type.ISOLLNumeric(10, "Should be 041234"));
  }

  @Override
  public void runTest(foam.core.X x) {
    Test_ISOFieldTest_Pack("1234", new byte[] { '0', '4', '1', '2', '3', '4'}, "\"1234\" is packed as [48, 52, 49, 50, 51, 52]");
    Test_ISOFieldTest_Unpack(new byte[] { '0', '4', '1', '2', '3', '4'}, "1234", "[48, 52, 49, 50, 51, 52] is unpacked as \"1234\"");
    Test_ISOFieldTest_Reversability("1234",  "Unpacked data equals original data");
  }
}
