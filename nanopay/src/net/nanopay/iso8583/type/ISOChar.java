package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;

public class ISOChar
  extends ISOStringFieldPackager
{
  public ISOChar(int len, String description) {
    super(len, description);
  }
}
