/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.lib.json;

import foam.lib.parse.*;
import foam.core.*;

public class UnknownReferenceParser
  extends ProxyParser
{
  private final static Parser instance__ = new UnknownReferenceParser();
  public static Parser instance() { return instance__; }

  public UnknownReferenceParser() {
    super(new Parser(){
      private Parser delegate = Whitespace.instance();

      public PStream parse(PStream ps, ParserContext x) {
        ps = ps.apply(delegate, x);
        if ( ps == null || ! ps.valid() ) {
          return null;
        }

        char head = ps.head();

        if ( head != '{' && head != '[' ) {
          return null;
        }
        Parser parser = null;
        if ( head == '[' ) {
          parser = new UnknownArrayParser();
        } else {
          parser = new UnknownObjectParser();
        }
        ps = parser.parse(ps, x);
        return ps;
      }
    });
  }
}
