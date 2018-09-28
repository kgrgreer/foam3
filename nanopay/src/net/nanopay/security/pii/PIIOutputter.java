package net.nanopay.security.pii;

import foam.core.FObject;
import foam.lib.json.Outputter;
import foam.core.PropertyInfo;

public class PIIOutputter 
  extends Outputter
{
  @Override 
  protected Boolean maybeOutputProperty(FObject fo, PropertyInfo prop, boolean includeComma) {
    if (prop.containsPII()) {
      return super.maybeOutputProperty(fo, prop, includeComma) && prop.containsPII();
    }
    return false;
  }

  @Override 
  protected boolean maybeOutputPropertyDelta(FObject oldFObject, FObject newFObject, PropertyInfo prop) {
    if (prop.containsPII()) {
      return super.maybeOutputPropertyDelta(oldFObject, newFObject, prop) && prop.containsPII();
    } 
    return false;
  }
}