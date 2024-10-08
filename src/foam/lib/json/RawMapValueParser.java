/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class RawMapValueParser
  extends ProxyParser
{
  private final static Parser instance__ = new RawMapValueParser();

  public static Parser instance() { return instance__; }

  private RawMapValueParser() {
    setDelegate(new Alt(
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
      new ArrayParser(instance()),
      MapParser.instance()));
  }
}
