/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

/** Simple Or X implementation.
    get - first check delegate, then parent
    put - put to delegate
 **/
public class OrX
  extends ProxyX
{
  X parent_;

  public OrX() {
    this(EmptyX.instance(), EmptyX.instance());
  }

  public OrX(X x) {
    this(x, EmptyX.instance());
  }

  public OrX(X parent, X delegate) {
    super(delegate);
    parent_ = parent;
  }

  public <T> T get(Class<T> key) {
    T t = getX().get(key);
    if ( t == null ) return (T) parent_.get(this, key);
    return t;
  }

  public Object get(X x, Object key) {
    Object o = getX().get(x, key);
    if ( o == null ) return parent_.get(x, key);
    return o;
  }

  public int getInt(X x, Object key, int defaultValue) {
    Object o = getX().get(x, key);
    if ( o == null ) o = parent_.get(x, key);
    if ( o == null ) return defaultValue;
    return (int) o;
  }

  public boolean getBoolean(X x, Object key, boolean defaultValue) {
    Object o = getX().get(x, key);
    if ( o == null ) o = parent_.get(x, key);
    if ( o == null ) return defaultValue;
    return (boolean) o;
  }

  public X cd(X x, String path) {
    X o = getX().cd(x, path);
    if ( o == null ) return parent_.cd(x, path);
    return o;
  }
}
