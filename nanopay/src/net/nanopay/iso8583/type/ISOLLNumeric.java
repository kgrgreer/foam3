package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ASCIIPrefixer;
import net.nanopay.iso8583.ISOStringFieldPackager;
import net.nanopay.iso8583.NullPadder;

public class ISOLLNumeric
  extends ISOStringFieldPackager
{
  public ISOLLNumeric(int len, String description) {
    super(NullPadder.INSTANCE, ASCIIPrefixer.LL, len, description);
  }
}
