/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

/** Last-resort method of locating thread-local session context. **/
public class XLocator
{

  protected static ThreadLocal<MutableX> x__ = new ThreadLocal<MutableX>() {
    protected MutableX initialValue() {
      return new MutableX();
    }
  };

  public static X set(X x) {
    x__.get().setX(x);
    return x;
  }

  public static X get() {
    return x__.get();
  }

}
