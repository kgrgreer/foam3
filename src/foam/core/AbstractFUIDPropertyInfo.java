/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.lib.formatter.FObjectFormatter;
import foam.lib.json.Outputter;

public abstract class AbstractFUIDPropertyInfo
    extends AbstractLongPropertyInfo
{
  @Override
  public void toJSON(Outputter outputter, Object value) {
    outputter.outputString(String.valueOf(value));
  }

  @Override
  public void format(FObjectFormatter formatter, FObject obj) {
    formatter.output(String.valueOf(get_(obj)));
  }
}
