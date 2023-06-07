/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class LiteralIC
  implements Parser
{
  protected String string_;
  protected Object value_;

  public LiteralIC(String s) {
    this(s, s);
  }

  public LiteralIC(String s, Object v) {
    string_ = s.toUpperCase();
    value_  = v;
  }

  public String getString() { return string_; }
  public void setString(String s) { string_ = s; }

  public PStream parse(PStream ps, ParserContext x) {
    for ( int i = 0 ; i < string_.length() ; i++ ) {
      if ( ! ps.valid() ||
          Character.toUpperCase(ps.head()) != string_.charAt(i) ) {
        return null;
      }

      ps = ps.tail();
    }

    return ps.setValue(value_);
  }

  public String toString() {
    return "LiteralIC(" + string_ + ","+((value_!=null)?value_.toString():"null")+")";
  }
}
