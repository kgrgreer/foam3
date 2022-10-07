/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.Collections;
import java.util.Map;

/** Proxy for X interface. **/
public class MutableX extends ProxyX {

  public MutableX() {
    this(EmptyX.instance());
  }

  public MutableX(X x) {
    setX(x);
  }

  public X put(Object name, Object value) {
    setX(getX().put(name, value));

    return this;
  }

  public X putFactory(Object name, XFactory factory) {
    setX(getX().putFactory(name, factory));

    return this;
  }
}
