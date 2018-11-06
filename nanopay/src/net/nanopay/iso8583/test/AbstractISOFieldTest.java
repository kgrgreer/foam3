package net.nanopay.iso8583.test;

public abstract class AbstractISOFieldTest
  extends foam.nanos.test.Test
{
  protected final net.nanopay.iso8583.ISOFieldPackager packager_;

  public AbstractISOFieldTest(net.nanopay.iso8583.ISOFieldPackager packager) {
    packager_ = packager;
  }

  @Override
  public abstract void runTest(foam.core.X x);

  protected void Test_ISOFieldTest_Pack(String data, byte[] expected, String message) {
    try {
      net.nanopay.iso8583.ISOField field = new net.nanopay.iso8583.ISOField(data, 0);
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      packager_.pack(field, baos);
      test(java.util.Arrays.equals(expected, baos.toByteArray()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }

  protected void Test_ISOFieldTest_Unpack(byte[] data, String expected, String message) {
    try {
      net.nanopay.iso8583.ISOField field = new net.nanopay.iso8583.ISOField();
      java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(data);
      packager_.unpack(field, bais);
      test(expected.equals(field.getValue()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }

  protected void Test_ISOFieldTest_Reversability(String data, String message) {
    try {
      // pack
      net.nanopay.iso8583.ISOField field = new net.nanopay.iso8583.ISOField(data, 0);
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      packager_.pack(field, baos);

      // unpack
      java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(baos.toByteArray());
      field = new net.nanopay.iso8583.ISOField();
      packager_.unpack(field, bais);

      test(data.equals(field.getValue()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }
}
