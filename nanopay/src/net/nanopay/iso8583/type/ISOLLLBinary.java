package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ASCIIPrefixer;
import net.nanopay.iso8583.ISOBinaryFieldPackager;
import net.nanopay.iso8583.LiteralBinaryInterpreter;

public class ISOLLLBinary
  extends ISOBinaryFieldPackager
{
  public ISOLLLBinary(int len, String description) {
    super(LiteralBinaryInterpreter.INSTANCE, ASCIIPrefixer.LLL, len, description);
  }
}
