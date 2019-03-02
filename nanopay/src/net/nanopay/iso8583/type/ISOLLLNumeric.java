package net.nanopay.iso8583.type;

import net.nanopay.iso8583.interpreter.ASCIIInterpreter;
import net.nanopay.iso8583.prefixer.ASCIIPrefixer;
import net.nanopay.iso8583.ISOStringFieldPackager;
import net.nanopay.iso8583.padder.NullPadder;

/**
 * ISO 8583 LLLVar Numeric field. This field can have a max length of 999
 */
public class ISOLLLNumeric
  extends ISOStringFieldPackager
  {
public ISOLLLNumeric(int len, String description) {
  super(ASCIIInterpreter.INSTANCE, NullPadder.INSTANCE, ASCIIPrefixer.LLL, len, description);
  }
  }
