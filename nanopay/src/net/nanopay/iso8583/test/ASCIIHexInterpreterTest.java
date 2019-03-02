package net.nanopay.iso8583.test;

public class ASCIIHexInterpreterTest
  extends AbstractBinaryInterpreterTest
{
  public ASCIIHexInterpreterTest() {
    super(net.nanopay.iso8583.interpreter.ASCIIHexInterpreter.INSTANCE);
  }

  @Override
  public void runTest(foam.core.X x)
  {
    Test_BinaryInterpreter_Interpret(new byte[] { (byte) 0xFF, (byte) 0x12 }, new byte[] { 0x46, 0x46, 0x31, 0x32 }, "[0xFF, 0x12] is interpreted as [0x46, 0x46, 0x31, 0x32]");
    Test_BinaryInterpreter_Uninterpret(new byte[] { 0x46, 0x46, 0x31, 0x32 }, new byte[] { (byte) 0xFF, (byte) 0x12 }, "[0x46, 0x46, 0x31, 0x32] is uninterpreted as [0xFF, 0x12]");
    Test_BinaryInterpreter_GetPackedLength(3, 6, "Packed length of 3 is 6");
    Test_BinaryInterpreter_Reversability(new byte[] { 0x01, 0x23, 0x45, 0x67, (byte) 0x89, (byte) 0xAB, (byte) 0xCD, (byte) 0xEF}, "Uninterpreted data equals original data");
  }
}
