/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

import java.util.LinkedList;
import java.util.List;

public class Join
  implements Parser
{
  Parser d_;

  public Join(Parser d) {
    d_ = d;
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = ps.apply(d_, x);
    if ( ps == null ) return null;

    StringBuilder sb = new StringBuilder();

    append(sb, ps.value());

    return ps.setValue(sb.toString());
  }

  void append(StringBuilder sb, Object o) {
    if ( o == null ) {
      // happens for optional parsers that don't parse
    } else if ( o instanceof Object[] ) {
      Object[] os = (Object[]) o;
      for ( var i = 0 ; i < os.length ; i++ )
        append(sb, os[i]);
    } else {
      sb.append(o.toString());
    }
  }
}
