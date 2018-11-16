package net.nanopay.iso8583.test;

import net.nanopay.iso8583.prefixer.NullPrefixer;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Arrays;

public class NullPrefixerTest
  extends foam.nanos.test.Test
{
  protected NullPrefixer prefixer = NullPrefixer.INSTANCE;

  @Override
  public void runTest(foam.core.X x) {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    prefixer.encodeLength(10, baos);
    test(Arrays.equals(new byte[0], baos.toByteArray()), "Length of 10 is not encoded");

    ByteArrayInputStream bais = new ByteArrayInputStream(new byte[] { (byte) 0x0A });
    test(-1 == prefixer.decodeLength(bais), "Length of 10 is not decoded.");
  }
}
