package net.nanopay.iso20022;

import foam.lib.json.IntParser;
import foam.lib.parse.*;

import java.util.Calendar;
import java.util.TimeZone;

public class ISODateParser
  extends ProxyParser
{
  public ISODateParser() {
    super(new Seq(
      new Optional(new Literal("\"")),
      new IntParser(),
      new Literal("-"),
      new IntParser(),
      new Literal("-"),
      new IntParser(),
      new Optional(new Literal("\""))));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps == null ) {
      return null;
    }

    if ( ps.value() == null ) {
      return ps.setValue(null);
    }

    Object[] result = (Object[]) ps.value();
    // To handle the optional literal since xml does not come with the literal
    int offset = result.length == 7 ? 1 : 0;

    // get calendar instance and clear it
    Calendar c = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
    c.clear();

    c.set(
      (Integer) result[0 + offset],
      (Integer) result[2 + offset] - 1, // Java calendar uses zero-indexed months
      (Integer) result[4 + offset]);

    return ps.setValue(c.getTime());
  }
}
