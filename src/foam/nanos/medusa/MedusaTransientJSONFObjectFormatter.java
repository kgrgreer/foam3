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
 *
 Developer Notes
 Flow 1 - nu object
 formatter.output(nu) // nu object,
 this calls formatter.outputProperty which in turn calls formatter.output
 which calls p.formatJSON(formatter, o), which again calls formatter.output
 with o's properties.
 The parentProp is the 'p' in p.formatJSON(formatter).

 Flow 2 - nu / old delta
 formatter.outputDelta
 this calls formatter.maybeOutputDelta, which calls maybeOutputFObjectProperty,
 which in turn calls maybeOutputDelta again. The parentProp is passed
 from maybeOutputDelta to/from maybeOutputFObjectProperty
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
      List<PropertyInfo> props = info.getAxiomsByClass(PropertyInfo.class);
      for ( PropertyInfo prop : props ) {
        if ( ( parentProp != null || // parent was storage transient
               prop.includeInID() ||
               prop.getStorageTransient() ) &&
             ! prop.getClusterTransient() ) {
          filteredAxioms.add(prop);
        }
      }
      propertyMap_.put(of, filteredAxioms);
      return filteredAxioms;
    }

    return propertyMap_.get(of);
  }
}
