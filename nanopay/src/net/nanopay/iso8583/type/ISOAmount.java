package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ASCIIInterpreter;
import net.nanopay.iso8583.ISOAmountFieldPackager;
import net.nanopay.iso8583.LeftPadder;
import net.nanopay.iso8583.NullPrefixer;

public class ISOAmount
  extends ISOAmountFieldPackager
{
  public ISOAmount(int len, String description) {
    super(ASCIIInterpreter.INSTANCE, LeftPadder.ZERO_PADDER, NullPrefixer.INSTANCE, len, description);
  }
}
