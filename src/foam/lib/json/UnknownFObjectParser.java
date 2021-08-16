/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.lib.json;

import foam.lib.parse.*;
import foam.core.X;

// TODO: Fix, doesn't parse {key:"}"}, use proper JSON parser
public class UnknownFObjectParser
  implements Parser
{
  private final static Parser instance__ = new UnknownFObjectParser();
  public static Parser instance() { return instance__; }

  public PStream parse(PStream ps, ParserContext x) {
    ps = ps.apply(UnknownObjectParser.instance(), x);

    if ( ps == null ) return null;

    UnknownFObject unknownFObject = new UnknownFObject();
//     System.err.println("Unknown JSON: " + ps.value().toString());
    unknownFObject.setJson(ps.value().toString());
    return ps.setValue(unknownFObject);
  }
}
