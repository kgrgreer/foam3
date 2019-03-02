package net.nanopay.iso8583.type;

import net.nanopay.iso8583.prefixer.ASCIIPrefixer;
import net.nanopay.iso8583.ISOBinaryFieldPackager;
import net.nanopay.iso8583.interpreter.LiteralBinaryInterpreter;

/**
 * ISO 8583 LLLVar Binary field. This field can have a max length of 999
 */
public class ISOLLLBinary
  extends ISOBinaryFieldPackager
{
  public ISOLLLBinary(int len, String description) {
    super(LiteralBinaryInterpreter.INSTANCE, ASCIIPrefixer.LLL, len, description);
  }
}
