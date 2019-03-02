package net.nanopay.iso8583.test;

public class ISOBinaryTest
  extends AbstractISOBinaryFieldTest
{
  public ISOBinaryTest() {
    super(new net.nanopay.iso8583.type.ISOBinary(2, "Should be 1234"));
  }

  @Override
  public void runTest(foam.core.X x) {
    Test_ISOBinaryFieldTest_Pack(new byte[] { 0x12, 0x34 }, new byte[] { '1', '2', '3', '4' }, "[0x12, 0x34] is packed as [49, 50, 51, 52]");
    Test_ISOBinaryFieldTest_Unpack(new byte[] { '1', '2', '3', '4' }, new byte[] { 0x12, 0x34 }, "[49, 50, 51, 52] is unpacked as [0x12, 0x34]");
    Test_ISOBinaryFieldTest_Reversability(new byte[] { 0x12, 0x34 }, "Unpacked data equals original data");
  }
}
