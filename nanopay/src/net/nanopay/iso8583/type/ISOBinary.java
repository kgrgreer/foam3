package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOBinaryFieldPackager;

public class ISOBinary
  extends ISOBinaryFieldPackager
{
  public ISOBinary(int len, String description) {
    super(len, description);
  }
}
