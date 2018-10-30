package net.nanopay.iso8583.test;

public class ISO87PackagerTest
  extends foam.nanos.test.Test
{
  protected final net.nanopay.iso8583.ISOPackager packager_;

  public ISO87PackagerTest() {
    packager_ = new net.nanopay.iso8583.packager.ISO87Packager();
  }

  @Override
  public void runTest(foam.core.X x) {
    try {
      net.nanopay.iso8583.ISOMessage message =
        new net.nanopay.iso8583.ISOMessage.Builder(x).setPackager(packager_).build();

      // unpack message
      byte[] expected = java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(
          System.getProperty("user.dir"), "/nanopay/src/net/nanopay/iso8583/test", "ISO87APackager.bin"));
      message.unpack(new java.io.ByteArrayInputStream(expected));

      // repack message
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      message.pack(baos);

      // verify repacked message equals original data
      test(java.util.Arrays.equals(expected, baos.toByteArray()), "Packing an unpacked ISO 8583:87 message produces the same result");
    } catch ( Throwable t ) {
      test(false, "Packing an unpacked ISO 8583:87 message produces the same result");
    }
  }
}
