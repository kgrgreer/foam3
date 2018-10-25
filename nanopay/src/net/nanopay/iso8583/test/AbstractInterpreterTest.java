package net.nanopay.iso8583.test;

import foam.core.X;
import net.nanopay.iso8583.interpreter.Interpreter;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Arrays;

public abstract class AbstractInterpreterTest
  extends foam.nanos.test.Test
{
  protected final Interpreter interpreter_;

  public AbstractInterpreterTest(Interpreter interpreter) {
    interpreter_ = interpreter;
  }

  @Override
  public abstract void runTest(X x);

  protected void Test_Interpreter_Interpret(String data, byte[] expected, String message) {
    try {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      interpreter_.interpret(data, baos);
      test(Arrays.equals(expected, baos.toByteArray()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }

  protected void Test_Interpreter_Uninterpret(byte[] data, String expected, String message) {
    try {
      ByteArrayInputStream bais = new ByteArrayInputStream(data);
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
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      interpreter_.interpret(data, baos);

      ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
      test(data.equals(interpreter_.uninterpret(data.length(), bais)), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }
}
