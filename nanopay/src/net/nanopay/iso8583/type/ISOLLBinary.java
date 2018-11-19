package net.nanopay.iso8583.type;

import net.nanopay.iso8583.prefixer.ASCIIPrefixer;
import net.nanopay.iso8583.ISOBinaryFieldPackager;
import net.nanopay.iso8583.interpreter.LiteralBinaryInterpreter;

/**
 * ISO 8583 LLVar Binary field. This field can have a max length of 99
 */
public class ISOLLBinary
  extends ISOBinaryFieldPackager
{
  public ISOLLBinary(int len, String description) {
    super(LiteralBinaryInterpreter.INSTANCE, ASCIIPrefixer.LL, len, description);
  }
}
