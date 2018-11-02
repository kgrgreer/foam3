package net.nanopay.iso8583.test;

public abstract class AbstractISOBinaryFieldTest
  extends foam.nanos.test.Test
{
  protected final net.nanopay.iso8583.ISOBinaryFieldPackager packager_;

  public AbstractISOBinaryFieldTest(net.nanopay.iso8583.ISOBinaryFieldPackager packager) {
    packager_ = packager;
  }

  @Override
  public abstract void runTest(foam.core.X x);

  protected void Test_ISOBinaryFieldTest_Pack(byte[] data, byte[] expected, String message) {
    try {
      net.nanopay.iso8583.ISOBinaryField field = new net.nanopay.iso8583.ISOBinaryField(data, 0);
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      packager_.pack(field, baos);
      test(java.util.Arrays.equals(expected, baos.toByteArray()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }

  protected void Test_ISOBinaryFieldTest_Unpack(byte[] data, byte[] expected, String message) {
    try {
      net.nanopay.iso8583.ISOBinaryField field = new net.nanopay.iso8583.ISOBinaryField();
      java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(data);
      packager_.unpack(field, bais);
      test(java.util.Arrays.equals(expected, field.getValue()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }

  protected void Test_ISOBinaryFieldTest_Reversability(byte[] data, String message) {
    try {
      // pack
      net.nanopay.iso8583.ISOBinaryField field = new net.nanopay.iso8583.ISOBinaryField(data, 0);
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      packager_.pack(field, baos);

      // unpack
      java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(baos.toByteArray());
      field = new net.nanopay.iso8583.ISOBinaryField();
      packager_.unpack(field, bais);

      test(java.util.Arrays.equals(data, field.getValue()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }
}
