package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;

public class ISONumericField
  extends ISOStringFieldPackager
{
  public ISONumericField(int len, String description) {
    super(len, description);
  }
}
