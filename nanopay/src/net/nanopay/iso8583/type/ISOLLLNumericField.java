package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;

public class ISOLLLNumericField
  extends ISOStringFieldPackager
{
  public ISOLLLNumericField(int len, String description) {
    super(len, description);
  }
}
