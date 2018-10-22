package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;

public class ISOLLLCharField
  extends ISOStringFieldPackager
{
  public ISOLLLCharField(int len, String description) {
    super(len, description);
  }
}
