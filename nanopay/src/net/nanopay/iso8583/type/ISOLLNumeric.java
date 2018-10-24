package net.nanopay.iso8583.type;

import net.nanopay.iso8583.interpreter.ASCIIInterpreter;
import net.nanopay.iso8583.prefixer.ASCIIPrefixer;
import net.nanopay.iso8583.ISOStringFieldPackager;
import net.nanopay.iso8583.padder.NullPadder;

/**
 * ISO 8583 LLVar Numeric field. This field can have a max length of 99
 */
public class ISOLLNumeric
  extends ISOStringFieldPackager
{
  public ISOLLNumeric(int len, String description) {
    super(ASCIIInterpreter.INSTANCE, NullPadder.INSTANCE, ASCIIPrefixer.LL, len, description);
  }
}
