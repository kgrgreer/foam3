package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;
import net.nanopay.iso8583.NullPrefixer;

public class ISOChar
  extends ISOStringFieldPackager
{
  public ISOChar(int len, String description) {
    super(NullPrefixer.INSTANCE, len, description);
  }
}
