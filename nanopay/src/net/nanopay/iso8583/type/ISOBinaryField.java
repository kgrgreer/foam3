package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOBinaryFieldPackager;

public class ISOBinaryField
  extends ISOBinaryFieldPackager
{
  public ISOBinaryField(int len, String description) {
    super(len, description);
  }
}
