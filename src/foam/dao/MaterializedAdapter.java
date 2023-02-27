/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.FObject;

/**
 * Adapter used by MaterializedDAO to convert objects in the sourceDAO to
 * the target objects.
 */
public interface MaterializedAdapter {

  /**
   * Adapt source object to be stored in the materialized index.
   * @param source object to adapt
   * @return target FObject
   */
  FObject adapt(FObject source);

  /**
   * Fast adapt source object to be removed from the materialized index.
   * @param source object to adapt
   * @return target FObject
   */
  default FObject fastAdapt(FObject source) {
    return adapt(source);
  }

  /**
   * DAOs to listen to
   */
  default String[] getObservedDAOs() {
    return new String[]{};
  }

  /**
   * Callback function on observed DAO update
   * to be implemented by subclasses
   * @param obj updated object from observed DAO
   */
  default void onObservedDAOUpdate(Object obj) {
    throw new RuntimeException("the onDAOUpdate listener function is not implemented");
  }
}
