/**
  * @license
  * Copyright 2018 The FOAM Authors. All Rights Reserved.
  * http://www.apache.org/licenses/LICENSE-2.0
  */

  package foam.lib.json;

  import foam.lib.parse.*;

  public class UnknownKeyValueParser0
    extends ProxyParser
  {
    public UnknownKeyValueParser0() {
      super(new Parser() {
        Parser delegate = new Seq2(1,5,Whitespace.instance(),
        new AnyKeyParser(),
        Whitespace.instance(),
        Literal.create(":"),
        Whitespace.instance(),
        new UnknownParser(),
        Whitespace.instance());

      public PStream parse(PStream ps, ParserContext x) {
        ps = ps.apply(delegate, x);
        if ( ps == null ) {
          return null;
        }

        Object[] objs = (Object[]) ps.value();
        String ret = "";
        ret = "\"" + objs[0].toString() + "\"" + ":" + objs[1].toString();
        // foam.nanos.logger.StdoutLogger.instance().debug("UnknownKeyValueParser0", ret);
        return ps.setValue(ret);
      }
      });
    }
  }
