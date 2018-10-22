package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;

public class ISOLLNumericField
  extends ISOStringFieldPackager
{
  public ISOLLNumericField(int len, String description) {
    super(len, description);
  }
}
