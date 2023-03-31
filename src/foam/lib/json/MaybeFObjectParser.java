/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.lib.json;

import foam.lib.parse.*;
import foam.core.X;

/**
 * Attempt to parse with regular FObjectParser, but on parse failure,
 * fall back to UnknownFObjectParser.
 */
public class MaybeFObjectParser
  extends UnknownFObjectParser
{
  private final static Parser instance__ = new MaybeFObjectParser();
  public static Parser instance() { return instance__; }

  public PStream parse(PStream ps, ParserContext x) {
    try {
      PStream result = ps.apply(AnyParser.instance(), x);
      if ( result != null ) return result;
    } catch (Throwable t) {
      // fall through to UnknownFObjectParser
    }
    return super.parse(ps, x);
  }
}
