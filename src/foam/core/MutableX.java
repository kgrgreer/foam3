/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public class MutableX extends ProxyX {
  public X put(Object name, Object value) {
    setX(getX().put(name, value));

    return this;
  }

  public X putFactory(Object name, XFactory factory) {
    setX(getX().putFactory(name, factory));

    return this;
  }
}
