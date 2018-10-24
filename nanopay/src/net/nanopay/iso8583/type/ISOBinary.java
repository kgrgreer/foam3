package net.nanopay.iso8583.type;

import net.nanopay.iso8583.interpreter.ASCIIHexInterpreter;
import net.nanopay.iso8583.ISOBinaryFieldPackager;
import net.nanopay.iso8583.prefixer.NullPrefixer;

public class ISOBinary
  extends ISOBinaryFieldPackager
{
  public ISOBinary(int len, String description) {
    super(ASCIIHexInterpreter.INSTANCE, NullPrefixer.INSTANCE, len, description);
  }
}
