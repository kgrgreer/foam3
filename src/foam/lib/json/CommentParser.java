/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;
import foam.parse.NewlineParser;

public class CommentParser
{
  public static Parser create() {
    return new Repeat0(new Seq0(Whitespace.instance(), Literal.create("//"),new Until(NewlineParser.create())));
  }
}
