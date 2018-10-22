package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;

public class ISOLLCharField
  extends ISOStringFieldPackager
{
  public ISOLLCharField(int len, String description) {
    super(len, description);
  }
}
