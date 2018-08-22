package net.nanopay.iso20022;

import foam.lib.json.IntParser;
import foam.lib.parse.*;
import foam.util.SafetyUtil;

import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

public class ISODateTimeParser
  extends ProxyParser
{
  protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  public ISODateTimeParser() {
    super(new Seq(
      new Literal("\""),
      new IntParser(),
      new Literal("-"),
      new IntParser(),
      new Literal("-"),
      new IntParser(),
      new Literal("T"),
      new IntParser(),
      new Literal(":"),
      new IntParser(),
      new Literal(":"),
      new IntParser(),
      new Literal("."),
      new Repeat(new Chars("0123456789")),
      new Alt(new Literal("+"), new Literal("-")),
      new IntParser(),
      new Literal(":"),
      new IntParser(),
      new Literal("\"")
    ));
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
    Calendar c = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
    c.clear();

    c.set(
      (Integer) result[1],
      (Integer) result[3] - 1, // Java calendar uses zero-indexed months
      (Integer) result[5],
      (Integer) result[7],
      (Integer) result[9],
      (Integer) result[11]);

    boolean zeroPrefixed = true;
    StringBuilder builder = sb.get();
    Object[] millis = (Object[]) result[13];

    for ( int i = 0 ; i < millis.length ; i++ ) {
      // do not prefix with zeros
      if ( zeroPrefixed && '0' == (char) millis[i] ) {
        continue;
      }

      // append millisecond
      if ( zeroPrefixed ) zeroPrefixed = false;
      builder.append((char) millis[i]);
    }

    // try to parse milliseconds, default to 0
    c.add(Calendar.MILLISECOND, ! SafetyUtil.isEmpty(builder.toString()) ?
      Integer.parseInt(builder.toString(), 10) : 0);

    // reset builder and build timezone string
    builder.setLength(0);
    builder.append("UTC")
      .append(result[14])
      .append(String.format("%02d", (Integer) result[15]))
      .append(":")
      .append(String.format("%02d", (Integer) result[17]));

    // set timezone correctly
    c.setTimeZone(TimeZone.getTimeZone(builder.toString()));
    return ps.setValue(c.getTime());
  }
}
