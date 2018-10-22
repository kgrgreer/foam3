package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOBinaryFieldPackager;

public class ISOLLBinaryField
  extends ISOBinaryFieldPackager
{
  public ISOLLBinaryField(int len, String description) {
    super(len, description);
  }
}
