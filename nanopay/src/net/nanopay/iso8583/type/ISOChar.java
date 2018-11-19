package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOStringFieldPackager;
import net.nanopay.iso8583.interpreter.LiteralInterpreter;
import net.nanopay.iso8583.prefixer.NullPrefixer;
import net.nanopay.iso8583.padder.TruncatingRightPadder;

/**
 * ISO Char field
 */
public class ISOChar
  extends ISOStringFieldPackager
{
  public ISOChar(int len, String description) {
    super(LiteralInterpreter.INSTANCE, TruncatingRightPadder.SPACE_PADDER, NullPrefixer.INSTANCE, len, description);
  }
}
