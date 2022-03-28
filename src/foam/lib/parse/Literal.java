package foam.lib.parse;

public class Literal extends AbstractLiteral {
  Object value_;

  public Literal(String s, Object v) {
    super(s);
    value_ = v;
  }
  @Override
  public Object value() {
    return value_;
  }
}
