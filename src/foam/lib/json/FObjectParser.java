/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.core.*;
import foam.lib.parse.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class FObjectParser
  extends ObjectNullParser
{
  private final static Map    map__      = new ConcurrentHashMap();
  private final static Parser instance__ = new FObjectParser();

  public static Parser instance() { return instance__ == null ? new ProxyParser() { public Parser getDelegate() { return instance__; } } : instance__; }

  /**
   * Implement the multiton pattern so we don't create the same
   * parser more than once.
   **/
  public static Parser create(Class cls) {
    if ( cls == null ) return instance();

    Parser p = (Parser) map__.get(cls.getName());

    if ( p == null ) {
      p = new FObjectParser(cls);
      map__.put(cls.getName(), p);
    }

    return p;
  }

  public FObjectParser(final Class defaultClass) {
    super(new Seq1(3,
      Whitespace.instance(),
      Literal.create("{"),
      Whitespace.instance(),
      new Parser() {
        private Parser delegate = new Seq1(4,
            new KeyParser("class"),
            Whitespace.instance(),
            Literal.create(":"),
            Whitespace.instance(),
            StringParser.instance(),
            new Optional(Literal.create(",")));

        public PStream parse(PStream ps, ParserContext x) {
          PStream originalPS = ps;

          try {
            PStream ps1 = ps.apply(delegate, x);

            Class c = null;
            if ( ps1 != null ) {
              try {
                c = Class.forName(ps1.value().toString());
              } catch (ClassNotFoundException t) { /* NOP */ }
            } else {
              c = defaultClass;
            }

            ParserContext subx = x.sub();
            Parser        subParser;

            if ( c == null ) {
              if ( ps1 == null ) return null;

              // If the class doesn't exist, try creating an object using the class name
              Object obj = ((X) x.get("X")).create(ps1.value().toString());
              subx.set("obj", obj);
              subParser = ModelParserFactory.getInstance(obj.getClass());
            } else {
              if ( c == foam.core.FObject.class ) return null;

              if ( c.isEnum() ) {
                subx.set("enum", c);
                subParser = EnumParserFactory.getInstance(c);
              } else {
                Object obj = ((X) x.get("X")).create(c);
                subx.set("obj", obj);
                subParser = ModelParserFactory.getInstance(obj.getClass());
              }
            }

            // Ensure that apply method is not invoked on null value
            if ( ps1 != null ) ps = ps1;

            ps = ps.apply(subParser, subx);

            if ( ps != null ) {
              var ret = subx.get("obj");
              if ( ret instanceof FObject )
                ((FObject) ret).init_();

              return ps.setValue(ret);
            }
            return null;
          } catch (Throwable t) {
            x.set("error", t);
            throw new RuntimeException(t);
          }
        }
      },
      Whitespace.instance(),
      Literal.create("}")));
  }

  public FObjectParser() {
    this(null);
  }

  public PStream parse(PStream ps, ParserContext x) {
    return getDelegate().parse(ps, x);
  }
}
