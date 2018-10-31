package net.nanopay.iso8583;

import foam.lib.json.NullParser;
import foam.lib.json.StringParser;
import foam.lib.parse.Alt;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.util.SecurityUtil;

/**
 * Parses a Hex string into a BitSet
 */
public class BitMapParser
  extends ProxyParser
{
  public BitMapParser() {
    super(
      new Alt(
        new NullParser(),
        new StringParser()
    ));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) {
      return null;
    }

    if ( ps.value() == null ) {
      return ps;
    }

    return ps.setValue(java.util.BitSet.valueOf(SecurityUtil.HexStringToByteArray((String) ps.value())));
  }
}
