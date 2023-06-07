/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.Map;

public interface FacetManager {
  public Object getInstanceOf(Object value, Class type, X x);
  public <T> T create(Class<T> type, X x);
  public <T> T create(Class<T> type, Map<String, Object> args, X x);
  public Object create(String clsName, X x);
  public Object create(String clsName, Map<String, Object> args, X x);
}
