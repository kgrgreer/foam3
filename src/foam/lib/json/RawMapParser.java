/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class RawMapParser
  extends MapParser
{
  private final static Parser instance__ = new RawMapParser();

  public static Parser instance() { return instance__; }

  public RawMapParser() {
    setDelegate(
      new Alt(
        NullParser.instance(),
        new Seq1(3,
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
          Literal.create("}"))
      )
    );
  }
}
