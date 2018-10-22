package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;

public class ISOLLNumeric
  extends ISOStringFieldPackager
{
  public ISOLLNumeric(int len, String description) {
    super(len, description);
  }
}
