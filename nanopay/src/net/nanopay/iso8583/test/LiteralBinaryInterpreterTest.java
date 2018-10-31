package net.nanopay.iso8583.test;

public class LiteralBinaryInterpreterTest
  extends AbstractBinaryInterpreterTest
{
  protected final byte[] data = new byte[] { 0x01, 0x23, 0x45 };

  public LiteralBinaryInterpreterTest() {
    super(net.nanopay.iso8583.interpreter.LiteralBinaryInterpreter.INSTANCE);
  }

  @Override
  public void runTest(foam.core.X x) {
    Test_BinaryInterpreter_Interpret(data, data, "[0x01, 0x23, 0x45] is interpreted as [0x01, 0x23, 0x45]");
    Test_BinaryInterpreter_Interpret(data, data, "[0x01, 0x23, 0x45] is uninterpreted as [0x01, 0x23, 0x45]");
    Test_BinaryInterpreter_GetPackedLength(3, 3, "Packed length of 3 is 3");
    Test_BinaryInterpreter_Reversability(data, "Uninterpreted data equals original data");
  }
}
