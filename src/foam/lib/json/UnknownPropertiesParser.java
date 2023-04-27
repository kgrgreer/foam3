/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class UnknownPropertiesParser
  extends ProxyParser
{
  public UnknownPropertiesParser() {
    super(new Parser() {
      Parser delegate = new Repeat(new Seq1(2, new Optional(CommentParser.create()), Whitespace.instance(), new Alt(new UnknownKeyValueParser0(), CommentParser.create())),
      Literal.create(","));
      public PStream parse(PStream ps, ParserContext x) {
        ps = ps.apply(delegate, x);
        if ( ps == null ) return null;
        Object[] objs = (Object[]) ps.value();
        StringBuilder res = new StringBuilder();
        for ( int i = 0 ; i < objs.length ; i++ ) {
          res.append(objs[i].toString());
          if ( i < objs.length - 1) {
            res.append(',');
          }
        }
        return ps.setValue(res.toString());
      }
    });
  }
}
