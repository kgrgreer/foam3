/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

/** Simple Or X implementation. **/
public class OrX
  extends    ProxyX
{
  X localX_;
  
  public OrX() {
    this(EmptyX.instance(), EmptyX.instance());
  }

  public OrX(X x, X delegate) {
    localX_ = x;
    setX(delegate);
  }

  public <T> T get(Class<T> key) {
    T t = localX_.get(key);
    if ( t == null ) return getX().get(key);
    return t;
  }

  public Object get(Object name) {
    Object o = localX_.get(name);
    if ( o == null ) return get(this, name);
    return o;
  }

  public Object get(X x, Object name) {
    Object o = localX_.get(x, name);
    if ( o == null ) return getX().get(x, name);
    return o;
  }

  public int getInt(X x, Object key, int defaultValue) {
    Object o = localX_.get(key);
    if ( o == null ) return getX().getInt(x, key, defaultValue);
    return (int) o;
  }

  public boolean getBoolean(X x, Object key, boolean defaultValue) {
    Boolean b = (Boolean) localX_.get(key);
    if ( b == null ) return getX().getBoolean(x, key, defaultValue);
    return b;
  }
}
