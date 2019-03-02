package net.nanopay.iso8583.test;

import foam.core.X;
import net.nanopay.iso8583.interpreter.LiteralInterpreter;

public class LiteralInterpreterTest
  extends AbstractInterpreterTest
{

  public LiteralInterpreterTest() {
    super(LiteralInterpreter.INSTANCE);
  }

  @Override
  public void runTest(X x) {
    Test_Interpreter_Interpret("Hello", new byte[] { 'H', 'e', 'l', 'l', 'o'}, "\"Hello\" is interpreted as [72, 101, 108, 108, 111]");
    Test_Interpreter_Uninterpret(new byte[] { 'H', 'e', 'l', 'l', 'o'}, "Hello", "[72, 101, 108, 108, 111] is interpreted as \"Hello\"");
    Test_Interpreter_GetPackedLength(3, 3, "Packed length of 3 is 3");
    Test_Interpreter_Reversability("Abc123:.-", "Uninterpreted data equals original data");
  }
}
