package net.nanopay.iso8583.test;

public class ISOCharTest
  extends AbstractISOFieldTest
{
  public ISOCharTest() {
    super(new net.nanopay.iso8583.type.ISOChar(6, "Should be ABCD  "));
  }

  @Override
  public void runTest(foam.core.X x) {
    Test_ISOFieldTest_Pack("ABCD", new byte[] { 'A', 'B', 'C', 'D', ' ', ' ' }, "\"ABCD\" is packed as [65, 66, 67, 68, 32, 32]");
    Test_ISOFieldTest_Unpack(new byte[] { 'A', 'B', 'C', 'D', ' ', ' '}, "ABCD", "[65, 66, 67, 68, 32, 32] is unpacked as \"ABCD\"");
    Test_ISOFieldTest_Reversability("ABCD",  "Unpacked data equals original data");
  }
}
