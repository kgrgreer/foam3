/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

/**
 * NullService facilitates the creation of null object of a given interface.
 *
 * Thus removing the need to manually create class for the null implementation
 * of the service interface eg. NullMyService.
 *
 * See. NullServiceTest.java for usage.
 *
 */
public class NullService {
  /**
   * Null service object marker
   */
  public interface Object { }

  /**
   * Null service object invocation handler
   */
  protected class ObjectHandler implements InvocationHandler {
    public java.lang.Object invoke(java.lang.Object proxy,
                                   Method method,
                                   java.lang.Object[] args) throws Throwable {
      var returnType = method.getReturnType();
      if ( returnType.isPrimitive() ) {
        if ( returnType == void.class    ) return null;
        if ( returnType == boolean.class ) return false;
        if ( returnType == byte.class    ) return (byte) 0;
        if ( returnType == char.class    ) return (char) 0;
        if ( returnType == short.class   ) return (short) 0;
        if ( returnType == int.class     ) return 0;
        if ( returnType == long.class    ) return 0L;
        if ( returnType == float.class   ) return 0.0F;
        if ( returnType == double.class  ) return 0.0;
      }
      return null;
    }
  }

  /**
   * Create a null service object of the {@code serviceClass}.
   *
   * @param serviceClass Service class to proxy instance
   * @return Null service object
   */
  public <T> T create(Class<T> serviceClass) {
    return (T) Proxy.newProxyInstance(
      getClass().getClassLoader(),
      new Class<?>[]{ serviceClass, Object.class },
      new ObjectHandler()
    );
  }
}
