package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;
import net.nanopay.iso8583.NullPrefixer;

public class ISONumeric
  extends ISOStringFieldPackager
{
  public ISONumeric(int len, String description) {
    super(NullPrefixer.INSTANCE, len, description);
  }
}
