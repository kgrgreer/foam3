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
  public FObject storageTransientDetectedAt_ = null;

  public boolean isStorageTransientDetected() {
    return storageTransientDetected_;
  }

  /**
   * Called from output - new/create flow
   */
  protected boolean maybeOutputProperty(FObject fo, PropertyInfo prop, boolean includeComma) {
    if ( isTransient(fo, prop) ) {
      return super.maybeOutputProperty(fo, prop, includeComma);
    }
    return false;
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
    if ( ! storageTransientDetectionEnabled_ )
      return super.compare(prop, oldFObject, newFObject);

    boolean isTransient = isTransient(newFObject, prop);

    if ( oldFObject == null && isTransient)
      return 1;

    if ( oldFObject != null && isTransient) {
      return super.compare(prop, oldFObject, newFObject);
    }

    return 0;
  }

  protected boolean isTransient(FObject fo, PropertyInfo prop) {
    if ( storageTransientDetectionEnabled_ ) {
      if ( prop.getClusterTransient() ) return false;

      // transient: true
      if ( prop.getStorageTransient() &&
           prop.getNetworkTransient() ) return false;

      // storageTransient: true (only)
      if ( prop.getStorageTransient() &&
           ! prop.getNetworkTransient() ) {
        if ( ! storageTransientDetected_ ) {
          storageTransientDetected_ = true;
          storageTransientDetectedAt_ = fo;
        }
        return true;
      }

      // other and nested properties
      if ( storageTransientDetected_ ) {
        // Suppress non-storageTransient at same model level
        if ( ! prop.getStorageTransient() &&
             storageTransientDetectedAt_.getClass().equals(fo.getClass()) ) {
          return false;
        }
        return true;
      }
    }
    return false;
  }
}
