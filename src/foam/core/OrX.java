/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

/** Simple Or X implementation.
    get - first test local x, then delegate
    put - put to delegate
 **/
public class OrX
  extends    ProxyX
{
  X localX_;
  
  public OrX() {
    this(EmptyX.instance(), EmptyX.instance());
  }

  public OrX(X x) {
    this(x, EmptyX.instance());
  }

  public OrX(X x, X delegate) {
    super(delegate);
    localX_ = x;
  }

  public <T> T get(Class<T> key) {
    T t = getX().get(key);
    if ( t == null ) return localX_.get(key);
    return t;
  }

  public Object get(X x, Object name) {
    Object o = getX().get(x, name);
    if ( o == null ) return localX_.get(x, name);
    return o;
  }

  public int getInt(X x, Object key, int defaultValue) {
    Object o = getX().getInt(x, key, defaultValue);
    if ( o == null ) return (int) localX_.get(key);
    return (int) o;
  }

  public boolean getBoolean(X x, Object key, boolean defaultValue) {
    Boolean b = (Boolean) getX().getBoolean(x, key, defaultValue);
    if ( b == null ) return (boolean) localX_.get(key);
    return b;
  }
}
