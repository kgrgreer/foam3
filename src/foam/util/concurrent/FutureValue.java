/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util.concurrent;

/**
  Store a single future/promised value.
  All get()ers block until the first time set() is called.
  set() can only be called once.

  Is useful for implementing caches which avoid having multiple in-flight requests for the
  same key.

  Usage:

  FutureValue f = new FutureValue();

  Thread 1..n-1:
  Object value = f.get(); // blocks

  Thread n:
  f.set('Some Value'); // Thread 1..n-1 unblock and receive value 'Some Value'
**/
public class FutureValue {
  protected Object  value_ = null;
  protected boolean isSet_ = false;

  public FutureValue() {
  }

  public synchronized void set(Object v) {
    if ( ! isSet_ ) {
      isSet_ = true;
      value_ = v;
      notifyAll();
    }
  }

  public synchronized Object get() {
    while ( ! isSet_ ) {
      try {
        wait();
      } catch (InterruptedException e) {
      }
    }
    return value_;
  }
}
