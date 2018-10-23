package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ASCIIPrefixer;
import net.nanopay.iso8583.ISOBinaryFieldPackager;

public class ISOLLLBinary
  extends ISOBinaryFieldPackager
{
  public ISOLLLBinary(int len, String description) {
    super(ASCIIPrefixer.LLL, len, description);
  }
}
