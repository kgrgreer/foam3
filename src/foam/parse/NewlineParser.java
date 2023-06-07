/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.Parser;

public class NewlineParser {
  public static Parser create() {
    return new Alt(Literal.create("\n"), Literal.create("\r\n"));
  }
}
