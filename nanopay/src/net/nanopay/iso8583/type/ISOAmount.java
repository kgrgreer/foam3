package net.nanopay.iso8583.type;

import net.nanopay.iso8583.interpreter.ASCIIInterpreter;
import net.nanopay.iso8583.ISOAmountFieldPackager;
import net.nanopay.iso8583.padder.LeftPadder;
import net.nanopay.iso8583.prefixer.NullPrefixer;

/**
 * ISO 8583 Amount field
 */
public class ISOAmount
  extends ISOAmountFieldPackager
{
  public ISOAmount(int len, String description) {
    super(ASCIIInterpreter.INSTANCE, LeftPadder.ZERO_PADDER, NullPrefixer.INSTANCE, len, description);
  }
}
