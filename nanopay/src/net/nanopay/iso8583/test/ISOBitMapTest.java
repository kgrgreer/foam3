package net.nanopay.iso8583.test;

public class ISOBitMapTest
  extends foam.nanos.test.Test
{
  protected net.nanopay.iso8583.ISOBitMapFieldPackager packager_ =
    new net.nanopay.iso8583.type.ISOBitMap(16, "Should be 4001000000000000");

  @Override
  public void runTest(foam.core.X x) {
    java.util.BitSet set = new java.util.BitSet(64);
    set.set(1);
    set.set(15);

    Test_ISOBitMapField_Pack(set, "8002000000000000".getBytes(), "BitSet is packed to 8002000000000000");
    Test_ISOBitMapField_Unpack("8002000000000000".getBytes(), set, "BitSet is unpack from 8002000000000000");
    Test_ISOBitMapField_Reversability(set, "Unpacked data equals original data");
  }

  protected void Test_ISOBitMapField_Pack(java.util.BitSet data, byte[] expected, String message) {
    try {
      net.nanopay.iso8583.ISOBitMapField field = new net.nanopay.iso8583.ISOBitMapField(data, 0);
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      packager_.pack(field, baos);
      test(java.util.Arrays.equals(expected, baos.toByteArray()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }

  protected void Test_ISOBitMapField_Unpack(byte[] data, java.util.BitSet expected, String message) {
    try {
      net.nanopay.iso8583.ISOBitMapField field = new net.nanopay.iso8583.ISOBitMapField();
      java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(data);
      packager_.unpack(field, bais);
      test(expected.equals(field.getValue()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }

  protected void Test_ISOBitMapField_Reversability(java.util.BitSet data, String message) {
    try {
      // pack
      net.nanopay.iso8583.ISOBitMapField field = new net.nanopay.iso8583.ISOBitMapField(data, 0);
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      packager_.pack(field, baos);

      // unpack
      java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(baos.toByteArray());
      field = new net.nanopay.iso8583.ISOBitMapField();
      packager_.unpack(field, bais);

      test(data.equals(field.getValue()), message);
    } catch ( Throwable t ) {
      test(false, message);
    }
  }
}
