/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;

public class StringToStringArrayParser
  extends StringParser
{
  private final static Parser instance__ = new StringToStringArrayParser();
  public static Parser instance() { return instance__; }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps == null         ) return null;
    if ( ps.value() == null ) return ps;

    var str = (String) ps.value();
    return ps.setValue(new String[] { str });
  }
}
