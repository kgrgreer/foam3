/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

/** ThreadLocal store for current PipelinePM PM. **/
public class PipelinePMLocator
{

  protected static ThreadLocal<PM> pm__ = new ThreadLocal<PM>() {
    protected PM initialValue() {
      return null;
    }
  };

  public static PM set(PM pm) {
    pm__.set(pm);
    return pm;
  }

  public static PM get() {
    return pm__.get();
  }

}
