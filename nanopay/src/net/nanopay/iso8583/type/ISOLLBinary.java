package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ASCIIPrefixer;
import net.nanopay.iso8583.ISOBinaryFieldPackager;

public class ISOLLBinary
  extends ISOBinaryFieldPackager
{
  public ISOLLBinary(int len, String description) {
    super(ASCIIPrefixer.LL, len, description);
  }
}
