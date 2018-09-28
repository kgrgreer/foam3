package net.nanopay.security.pii;

public class PIIOutputter
  extends foam.lib.json.Outputter
{
  public PIIOutputter() {
    super();
    outputClassNames_ = false;
  }

  @Override
  protected Boolean maybeOutputProperty(foam.core.FObject fo, foam.core.PropertyInfo prop, boolean includeComma) {
    return prop.containsPII() && super.maybeOutputProperty(fo, prop, includeComma);
  }

  @Override 
  protected boolean maybeOutputPropertyDelta(foam.core.FObject old, foam.core.FObject nu, foam.core.PropertyInfo prop) {
    return prop.containsPII() && super.maybeOutputPropertyDelta(old, nu, prop);
  }
}
