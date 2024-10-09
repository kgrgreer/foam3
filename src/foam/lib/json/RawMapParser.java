/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

/**
 * RawMapParser supports parsing JSON as plain map object with elements of only
 * primitive values. Unlike its relative MapParser where elements can be an
 * FObject, class reference and property reference, etc..., RawMapParser will
 * produce a nested map as a result.
 *
 * Eg. RawMapParser will parse the following JSON
 *    {
 *      "view": {
 *        "class": "MyView"
 *      }
 *    }
 *
 * As:
 *    map.get("view");                // a map object
 *    map.get("view").get("class");   // "MyView"
 *
 *
 * RawMapParser allows the server to treat the JSON object sent from the client
 * or coded in the build journal as raw map.
 *
 */
public class RawMapParser
  extends MapParser
{
  private final static Parser instance__ = new RawMapParser();

  public static Parser instance() { return instance__ == null ? new ProxyParser() { public Parser getDelegate() { return instance__; } } : instance__; }

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
