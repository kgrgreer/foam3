package net.nanopay.iso8583.type;

import net.nanopay.iso8583.interpreter.ASCIIInterpreter;
import net.nanopay.iso8583.prefixer.ASCIIPrefixer;
import net.nanopay.iso8583.ISOStringFieldPackager;
import net.nanopay.iso8583.padder.NullPadder;

public class ISOLLNumeric
  extends ISOStringFieldPackager
{
  public ISOLLNumeric(int len, String description) {
    super(ASCIIInterpreter.INSTANCE, NullPadder.INSTANCE, ASCIIPrefixer.LL, len, description);
  }
}
