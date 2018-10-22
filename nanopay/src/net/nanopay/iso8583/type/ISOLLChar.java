package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ASCIIPrefixer;
import net.nanopay.iso8583.ISOStringFieldPackager;

public class ISOLLChar
  extends ISOStringFieldPackager
{
  public ISOLLChar(int len, String description) {
    super(ASCIIPrefixer.LL, len, description);
  }
}
