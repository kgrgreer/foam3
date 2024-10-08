/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class RawMapParser
  extends ObjectNullParser
{
  private final static Parser instance__ = new RawMapParser();

  public static Parser instance() { return instance__; }

  private final static Parser mapValue__ = new Alt(
    NullParser.instance(),
    StringParser.instance(),
    BooleanParser.instance(),
    // parse long but fail if decimal is found
    new Seq1(0,
      LongParser.instance(),
      new Not(Literal.create("."))
    ),
    DoubleParser.instance(),
    StringArrayParser.instance(),
    new StringDoubleArrayParser(),
    ArrayParser.instance(),
    MapParser.instance());

  private RawMapParser() {
    super(new Seq1(3,
      Whitespace.instance(),
      Literal.create("{"),
      Whitespace.instance(),
      new Repeat(new Seq2(1, 5,
        Whitespace.instance(),
        new AnyKeyParser(),
        Whitespace.instance(),
        Literal.create(":"),
        Whitespace.instance(),
        RawMapValueParser.instance()),
        new Seq0(Whitespace.instance(), Literal.create(","))),
      Whitespace.instance(),
      Literal.create("}")));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    Object[] values = (Object[]) ps.value();
    java.util.Map map = new java.util.HashMap(values.length);

    for ( int i = 0 ; i < values.length ; i++ ) {
      Object[] item = (Object[]) values[i];

      map.put(item[0], item[1]);
    }

    return ps.setValue(map);
  }
}
