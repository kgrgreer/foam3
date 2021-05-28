/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.lib.formatter.JSONFObjectFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Include all properties of a storageTransient property.
 */
public class MedusaTransientJSONFObjectFormatter
  extends JSONFObjectFormatter {

  public MedusaTransientJSONFObjectFormatter(X x) {
    super(x);
  }

  public MedusaTransientJSONFObjectFormatter() {
    super();
  }

  /**
   * If parentProp is storageTransient, include all properties.
   */
  protected synchronized List getProperties(PropertyInfo parentProp, ClassInfo info) {
    String of = info.getObjClass().getName();

    if ( propertyMap_.containsKey(of) && propertyMap_.get(of).isEmpty() ) {
      propertyMap_.remove(of);
    }

    if ( ! propertyMap_.containsKey(of) ) {
      List<PropertyInfo> filteredAxioms = new ArrayList<>();
      Iterator e = info.getAxiomsByClass(PropertyInfo.class).iterator();
      while ( e.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) e.next();
        if ( propertyPredicate_ == null ||
             ( parentProp != null && parentProp.getStorageTransient() ) ||
             propertyPredicate_.propertyPredicateCheck(this.x_, of, prop) ) {
          filteredAxioms.add(prop);
        }
      }
      propertyMap_.put(of, filteredAxioms);
      return filteredAxioms;
    }

    return propertyMap_.get(of);
  }
}
