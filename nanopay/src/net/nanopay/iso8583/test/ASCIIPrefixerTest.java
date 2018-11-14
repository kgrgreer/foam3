package net.nanopay.iso8583.test;

import net.nanopay.iso8583.prefixer.ASCIIPrefixer;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public class ASCIIPrefixerTest
  extends foam.nanos.test.Test
{
  protected ASCIIPrefixer llprefixer = ASCIIPrefixer.LL;

  protected ASCIIPrefixer lllprefixer = ASCIIPrefixer.LLL;

  @Override
  public void runTest(foam.core.X x) {
    try {
      // test ASCIIPrefixer.LL encode length
      Test_ASCIIPrefixer_EncodeLength(llprefixer, 5,  "05", "Length of  5 is encoded to 05 using ASCIIPrefixer.LL");
      Test_ASCIIPrefixer_EncodeLength(llprefixer, 50, "50", "Length of 10 is encoded to 50 using ASCIIPrefixer.LL");
      try {
        llprefixer.encodeLength(500, new ByteArrayOutputStream());
      } catch ( IllegalArgumentException t ) {
        test("Invalid length: 500".equals(t.getMessage()), "Length of 500 throws an IllegalArgumentException");
      }

      // test ASCIIPrefixer.LLL encode length
      Test_ASCIIPrefixer_EncodeLength(lllprefixer, 5,   "005", "Length of  5 is encoded to 005 using ASCIIPrefixer.LLL");
      Test_ASCIIPrefixer_EncodeLength(lllprefixer, 50,  "050", "Length of 10 is encoded to 050 using ASCIIPrefixer.LLL");
      Test_ASCIIPrefixer_EncodeLength(lllprefixer, 500, "500", "Length of 10 is encoded to 500 using ASCIIPrefixer.LLL");
      try {
        lllprefixer.encodeLength(5000, new ByteArrayOutputStream());
      } catch ( IllegalArgumentException t ) {
        test("Invalid length: 5000".equals(t.getMessage()), "Length of 5000 throws an IllegalArgumentException");
      }
    } catch ( Throwable t ) {
      test(false, "encodeLength should not throw an exception");
    }

    try {
      // test ASCIIPrefixer.LL decode length
      Test_ASCIIPrefixer_DecodeLength(llprefixer, "05",  5, "Length of  5 is encoded to 05 using ASCIIPrefixer.LL");
      Test_ASCIIPrefixer_DecodeLength(llprefixer, "50", 50, "Length of 10 is encoded to 50 using ASCIIPrefixer.LL");

      // test ASCIIPrefixer.LLL decode length
      Test_ASCIIPrefixer_DecodeLength(lllprefixer, "005",   5, "Length of  5 is encoded to 005 using ASCIIPrefixer.LLL");
      Test_ASCIIPrefixer_DecodeLength(lllprefixer, "050",  50, "Length of 10 is encoded to 050 using ASCIIPrefixer.LLL");
      Test_ASCIIPrefixer_DecodeLength(lllprefixer, "500", 500, "Length of 10 is encoded to 500 using ASCIIPrefixer.LLL");
    } catch ( Throwable t ) {
      test(false, "decodeLength should not throw an exception");
    }
  }

  protected void Test_ASCIIPrefixer_EncodeLength(ASCIIPrefixer prefixer, int length, String expected, String message)
    throws java.io.IOException
  {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    prefixer.encodeLength(length, baos);
    test(Arrays.equals(expected.getBytes(StandardCharsets.ISO_8859_1), baos.toByteArray()), message);
  }

  protected void Test_ASCIIPrefixer_DecodeLength(ASCIIPrefixer prefixer, String length, int expected, String message)
    throws java.io.IOException
  {
    ByteArrayInputStream bais = new ByteArrayInputStream(length.getBytes(StandardCharsets.ISO_8859_1));
    test(expected == prefixer.decodeLength(bais), message);
  }
}
