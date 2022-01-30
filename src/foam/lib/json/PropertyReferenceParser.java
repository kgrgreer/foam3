/**
 * @license Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;
import foam.core.ClassInfo;

public class PropertyReferenceParser
  extends ProxyParser
{
  private static Parser instance__ = new PropertyReferenceParser();
  public static Parser instance() { return instance__; }

  public PropertyReferenceParser() {
    super(new Seq0(
      Whitespace.instance(),
      Literal.create("{"),
      Whitespace.instance(),
      new KeyParser("class"),
      Whitespace.instance(),
      Literal.create(":"),
      Whitespace.instance(),
      Literal.create("\"__Property__\""),
      Whitespace.instance(),
      Literal.create(","),
      Whitespace.instance(),
      new KeyParser("forClass_"),
      Whitespace.instance(),
      Literal.create(":"),
      Whitespace.instance(),
      new Parser() {
        private Parser delegate = StringParser.instance();

        public PStream parse(PStream ps, ParserContext x) {
          ps = ps.apply(delegate, x);
          if ( ps != null ) {
            x.set("forClass_", ps.value());
          }
          return ps;
        }
      },
      Literal.create(","),
      Whitespace.instance(),
      new KeyParser("name"),
      Whitespace.instance(),
      Literal.create(":"),
      Whitespace.instance(),
      new Parser() {
        private Parser delegate = StringParser.instance();

        public PStream parse(PStream ps, ParserContext x) {
          ps = ps.apply(delegate, x);
          if ( ps != null ) {
            x.set("name", ps.value());
          }
          return ps;
        }
      },
      Whitespace.instance(),
      Literal.create("}")));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps != null ) {
      String classId = (String) x.get("forClass_");
      String propName = (String) x.get("name");

      try {
        Class cls = Class.forName(classId);

        // TODO(adamvy): Use the context to resolve the class rather than reflection
        // TODO(adamvy): Better handle errors.

        ClassInfo info = (ClassInfo) cls.getMethod("getOwnClassInfo").invoke(null);

        Object axiom = info.getAxiomByName(propName);
        if ( axiom == null ) {
          System.err.println("Unknown Property Reference: " + classId + "." + propName);
        }
        return ps.setValue(axiom);
      } catch (Exception e) {
        x.set("error", e);
        throw new RuntimeException(e);
      }
    }

    return ps;
  }
}
