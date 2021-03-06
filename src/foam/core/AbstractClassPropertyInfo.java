package foam.core;

import foam.lib.json.Outputter;

public abstract class AbstractClassPropertyInfo extends AbstractObjectPropertyInfo {
  @Override
  public void toJSON(Outputter outputter, Object value) {
    outputter.outputString(((ClassInfo) value).getId());
  }

  public String getSQLType() {
    return "";
  }

  @Override
  public void cloneProperty(FObject source, FObject dest) {
    set(dest, get(source));
  }
}
