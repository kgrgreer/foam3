package net.nanopay.iso8583.test;

public abstract class AbstractInterpreterTest
  extends foam.nanos.test.Test
{
  protected final net.nanopay.iso8583.interpreter.Interpreter interpreter_;

  public AbstractInterpreterTest(net.nanopay.iso8583.interpreter.Interpreter interpreter) {
    interpreter_ = interpreter;
  }

  @Override
  public abstract void runTest(foam.core.X x);

  protected void Test_Interpreter_Interpret(String data, byte[] expected, String message) {
    try {
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      interpreter_.interpret(data, baos);
      test(java.util.Arrays.equals(expected, baos.toByteArray()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }

  protected void Test_Interpreter_Uninterpret(byte[] data, String expected, String message) {
    try {
      java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(data);
      test(expected.equals(interpreter_.uninterpret(expected.length(), bais)), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }

  protected void Test_Interpreter_GetPackedLength(int data, int expected, String message) {
    test(expected == interpreter_.getPackedLength(data), message);
  }

  /**
   * Test interpreting and uninterpreting to see if it matches original data
   */
  protected void Test_Interpreter_Reversability(String data, String message) {
    try {
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      interpreter_.interpret(data, baos);

      java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(baos.toByteArray());
      test(data.equals(interpreter_.uninterpret(data.length(), bais)), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }
}
