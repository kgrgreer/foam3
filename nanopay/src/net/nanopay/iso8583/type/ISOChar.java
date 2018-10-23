package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;
import net.nanopay.iso8583.NullPrefixer;
import net.nanopay.iso8583.TruncatingRightPadder;

public class ISOChar
  extends ISOStringFieldPackager
{
  public ISOChar(int len, String description) {
    super(TruncatingRightPadder.SPACE_PADDER, NullPrefixer.INSTANCE, len, description);
  }
}
