package net.nanopay.iso8583.test;

public class ISO93PackagerTest
  extends foam.nanos.test.Test
{
  protected final net.nanopay.iso8583.ISOPackager packager_;

  public ISO93PackagerTest() {
    packager_ = new net.nanopay.iso8583.packager.ISO93Packager();
  }

  @Override
  public void runTest(foam.core.X x) {
    try {
      net.nanopay.iso8583.ISOMessage message =
        new net.nanopay.iso8583.ISOMessage.Builder(x).setPackager(packager_).build();
      java.io.File file = new java.io.File(System.getProperty("user.dir") +
        "/nanopay/src/net/nanopay/iso8583/test/ISO93APackager.bin");
      message.unpack(new java.io.FileInputStream(file));
      test(true, "Unpacking ISO 8583:93 message");
    } catch ( Throwable t ) {
      t.printStackTrace();
      test(false, "Unpacking ISO 8583:93 message");
    }
  }
}
