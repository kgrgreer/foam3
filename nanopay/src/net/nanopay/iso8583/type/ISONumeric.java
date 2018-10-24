package net.nanopay.iso8583.type;

import net.nanopay.iso8583.interpreter.ASCIIInterpreter;
import net.nanopay.iso8583.ISOStringFieldPackager;
import net.nanopay.iso8583.padder.LeftPadder;
import net.nanopay.iso8583.prefixer.NullPrefixer;

public class ISONumeric
  extends ISOStringFieldPackager
{
  public ISONumeric(int len, String description) {
    super(ASCIIInterpreter.INSTANCE, LeftPadder.ZERO_PADDER, NullPrefixer.INSTANCE, len, description);
  }
}
