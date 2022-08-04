/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.mlang.F;

public class CopyAdapter
  implements foam.mlang.F
{
  protected final ClassInfo of_;

  public CopyAdapter(ClassInfo of) {
    of_ = of;
  }

  public Object f(Object source) {
    FObject s = (FObject) source;
    try {
      return ((FObject) of_.newInstance()).copyFrom(s);
    } catch (Throwable ex) {
      throw new RuntimeException("Cannot adapt: " + ex.getMessage(), ex);
    }
  }

}
