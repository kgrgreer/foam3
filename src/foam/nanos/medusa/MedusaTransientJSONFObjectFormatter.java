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
 Intercepts during output to detect if property is storageTransient
 and if it has updates.

 Flow 1 - nu object
 formatter.output(nu) // nu object,
 this calls formatter.outputProperty which in turn calls formatter.output
 which calls p.formatJSON(formatter, o), which again calls formatter.output
 with o's properties.
 The parentProp is the 'p' in p.formatJSON(formatter).

 Flow 2 - nu / old delta
 formatter.maybeOutputDelta
 which calls maybeOutputFObjectProperty,
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

  public boolean storageTransientDetectionEnabled_ = false;
  public boolean storageTransientDetected_ = false;

  public boolean isStorageTransientDetected() {
    return storageTransientDetected_;
  }

  /**
   * Called from output - new/create flow
   */
  protected boolean maybeOutputProperty(FObject fo, PropertyInfo prop, boolean includeComma) {
    boolean maybe = super.maybeOutputProperty(fo, prop, includeComma);
    if ( maybe &&
         storageTransientDetectionEnabled_ &&
         prop.getStorageTransient() ) {
      storageTransientDetected_ = true;
    }
    return maybe;
  }

  /**
   * Called on new/create flow
   */
  public void output(FObject o) {
    storageTransientDetectionEnabled_ = true;
    super.output(o);
  }

  /**
   * Called on update flow
   */
  public boolean maybeOutputDelta(FObject oldFObject, FObject newFObject, PropertyInfo parentProp, ClassInfo defaultClass) {
    storageTransientDetectionEnabled_ = true;
    return super.maybeOutputDelta(oldFObject, newFObject, parentProp, defaultClass);
  }

  /**
   * Called from maybeOutputDelta - update flow
   */
  public int compare(PropertyInfo prop, FObject oldFObject, FObject newFObject) {
    int result = prop.compare(oldFObject, newFObject);
    if ( result != 0 &&
         storageTransientDetectionEnabled_ &&
         prop.getStorageTransient() ) {
      storageTransientDetected_ = true;
    }
    return result;
  }
}
