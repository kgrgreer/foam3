package net.nanopay.iso8583.test;

import foam.core.X;
import net.nanopay.iso8583.interpreter.ASCIIInterpreter;

public class ASCIIInterpreterTest
  extends AbstractInterpreterTest {
  protected ASCIIInterpreter interpreter = ASCIIInterpreter.INSTANCE;

  public ASCIIInterpreterTest() {
    super(ASCIIInterpreter.INSTANCE);
  }

  @Override
  public void runTest(X x) {
    Test_Interpreter_Interpret("123", new byte[]{49, 50, 51}, "\"123\" is interpreted as [49, 50, 51]");
    Test_Interpreter_Uninterpret(new byte[]{49, 50, 51}, "123", "[49, 50, 51] is uninterpreted as \"123\"");
    Test_Interpreter_GetPackedLength(3, 3, "Packed length of 3 is 3");
    Test_Interpreter_Reversability("Abc123:.-", "Uninterpreted data equals original data");
  }
}
