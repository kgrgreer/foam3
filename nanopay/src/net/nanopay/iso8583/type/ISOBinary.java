package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOBinaryFieldPackager;
import net.nanopay.iso8583.NullPrefixer;

public class ISOBinary
  extends ISOBinaryFieldPackager
{
  public ISOBinary(int len, String description) {
    super(NullPrefixer.INSTANCE, len, description);
  }
}
