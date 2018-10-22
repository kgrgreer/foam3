package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOAmountFieldPackager;

public class ISOAmount
  extends ISOAmountFieldPackager
{

  public ISOAmount(int len, String description) {
    super(len, description);
  }
}
