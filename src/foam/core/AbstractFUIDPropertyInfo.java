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
    outputter.output(adapt(value));
  }

  @Override
  public void format(FObjectFormatter formatter, FObject obj) {
    formatter.output(adapt(get_(obj)));
  }

  protected String adapt(Object value) {
    return value != null ? String.valueOf(value) : "0";
  }

  @Override
  public foam.lib.parse.Parser jsonParser() {
    return foam.lib.json.AnyParser.instance();
  }

  @Override
  public foam.lib.parse.Parser queryParser() {
    return foam.lib.json.AnyParser.instance();
  }

  @Override
  public foam.lib.parse.Parser csvParser() {
    return foam.lib.json.AnyParser.instance();
  }
}
