package net.nanopay.security;

import foam.lib.json.NullParser;
import foam.lib.json.Whitespace;
import foam.lib.parse.*;

public class HexStringArrayParser
  extends ProxyParser
{
  public HexStringArrayParser() {
    super(
      new Alt(
        new NullParser(),
        new Seq1(3,
          new Whitespace(),
          new Literal("["),
          new Whitespace(),
          new Repeat(
            new HexStringParser(),
            new Seq0(new Whitespace(), new Literal(","), new Whitespace())),
          new Whitespace(),
          new Literal("]"))
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

    Object[] objs = (Object[]) ps.value();
    byte[][] value = new byte[objs.length][];
    for ( int i = 0 ; i < objs.length ; i++ ) {
      byte[] obj = (byte[]) objs[i];
      value[i] = new byte[obj.length];
      System.arraycopy(obj, 0, value[i], 0, value[i].length);
    }

    return ps.setValue(value);
  }
}
