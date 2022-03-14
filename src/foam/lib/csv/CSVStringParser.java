/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.lib.parse.Alt;
import foam.lib.parse.Parser;
import foam.lib.parse.ProxyParser;
import foam.lib.csv.CSVCommaSeparator;

public class CSVStringParser
  extends ProxyParser
{
  private final static Parser instance__ = new CSVStringParser();

  public static Parser instance() { return instance__; }

  // TODO: make private
  // ^^^ why? reason to be determined... ^^^
  public CSVStringParser(CSVCommaSeparator commaSeparator) {
    super(
      new Alt(new CSVNormalStringParser(commaSeparator), new CSVEscapeStringParser(commaSeparator))
    );
  }
  
  public CSVStringParser() {
    this(CSVCommaSeparator.COMMA);
  }
}
