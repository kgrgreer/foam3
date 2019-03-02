package net.nanopay.iso8583.test;

public abstract class AbstractBinaryInterpreterTest
  extends foam.nanos.test.Test
{
  protected final net.nanopay.iso8583.interpreter.BinaryInterpreter interpreter_;

  public AbstractBinaryInterpreterTest(net.nanopay.iso8583.interpreter.BinaryInterpreter interpreter) {
    interpreter_ = interpreter;
  }

  @Override
  public abstract void runTest(foam.core.X x);

  /**
   * Test interpret method
   */
  protected void Test_BinaryInterpreter_Interpret(byte[] data, byte[] expected, String message) {
    try {
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      interpreter_.interpret(data, baos);
      test(java.util.Arrays.equals(expected, baos.toByteArray()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }

  }

  /**
   * Test uninterpret method
   */
  protected void Test_BinaryInterpreter_Uninterpret(byte[] data, byte[] expected, String message) {
    try {
      java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(data);
      test(java.util.Arrays.equals(expected, interpreter_.uninterpret(expected.length, bais)), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }

  /**
   * Test get packed length method
   */
  protected void Test_BinaryInterpreter_GetPackedLength(int data, int expected, String message) {
    test(expected == interpreter_.getPackedLength(data), message);
  }

  /**
   * Test interpreting and uninterpreting to see if it matches original data
   */
  protected void Test_BinaryInterpreter_Reversability(byte[] data, String message) {
    try {
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      interpreter_.interpret(data, baos);

      java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(baos.toByteArray());
      test(java.util.Arrays.equals(data, interpreter_.uninterpret(data.length, bais)), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }
}
