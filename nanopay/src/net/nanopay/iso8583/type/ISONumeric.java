package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;
import net.nanopay.iso8583.LeftPadder;
import net.nanopay.iso8583.NullPrefixer;

public class ISONumeric
  extends ISOStringFieldPackager
{
  public ISONumeric(int len, String description) {
    super(LeftPadder.ZERO_PADDER, NullPrefixer.INSTANCE, len, description);
  }
}
