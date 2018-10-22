package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;

public class ISOCharField
  extends ISOStringFieldPackager
{
  public ISOCharField(int len, String description) {
    super(len, description);
  }
}
