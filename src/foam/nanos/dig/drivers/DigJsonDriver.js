/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.drivers',
  name: 'DigJsonDriver',
  extends: 'foam.nanos.dig.drivers.DigFormatDriver',

  flags: [ 'java' ],

  javaImports: [
    'foam.core.*',
    'foam.dao.DAO',
    'foam.lib.json.JSONParser',
    'foam.lib.json.MapParser',
    'foam.lib.parse.ParserContextImpl',
    'foam.lib.parse.StringPStream',
    'foam.lib.parse.PStream',
    'foam.nanos.dig.*',
    'foam.nanos.dig.exception.*',
    'foam.nanos.http.*',
    'foam.util.SafetyUtil',
    'java.io.PrintWriter',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'java.util.Map',
    'java.util.Set'
  ],

  properties: [
    {
      name: 'format',
      value: 'JSON'
    }
  ],

  methods: [
    {
      name: 'parseFObjects',
      javaCode: `
      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);

      var p = x.get(HttpParameters.class);
      if ( p.getParameter("nameMapping") != null ) {
        var ret = parseMap(p.getParameter("nameMapping"));
        if ( ret.value() != null && ((Map)ret.value()).size() != 0 ) {
          data = new FieldNameMapGrammar().replaceFields(data, (Map) ret.value());
        }
      }

      // Attempt to parse array
      ClassInfo cInfo = dao.getOf();
      Object o = jsonParser.parseStringForArray(data, cInfo.getObjClass());

      // Attempt to parse single object
      if ( o == null )
        o = jsonParser.parseString(data, cInfo.getObjClass());

      if ( o == null ) {
        DigUtil.outputException(x, new ParsingErrorException("Invalid JSON Format"), getFormat());
        return null;
      }

      List list = null;
      if ( o instanceof Object[] ) {
        Object[] objs = (Object[]) o;
        list = Arrays.asList(objs);
      } else {
        list = new ArrayList();
        list.add(o);
      }

      if ( p.getParameter("fieldValue") != null ) {
        var ret = parseMap(p.getParameter("fieldValue"));
        if ( ret != null && ((Map)ret.value()).size() != 0 ) {
          Map map  = (Map) ret.value();
          Set keys = map.entrySet();
          for ( Object ob : list ) {
            if ( ob instanceof FObject ) {
              FObject f = (FObject) ob;
              map.forEach((k,v) -> {
                PropertyInfo prop = (PropertyInfo) f.getClassInfo().getAxiomByName((String)k);
                if ( prop != null ) {
                  prop.set(f, map.get(k));
                }
              });
            }
          }
        }
      }

      return o instanceof FObject ? o : list;
      `
    },
    {
      name: 'outputFObjects',
      javaCode: `
      PrintWriter out    = x.get(PrintWriter.class);

      if ( fobjects == null || fobjects.size() == 0 ) {
        out.println("[]");
        return;
      }

      var outputterJson = getOutputter(x);
      outputterJson.output(fobjects.toArray());

      // Output the formatted data
      out.println(outputterJson.toString());
      `
    },
    {
      name: 'outputFObject',
      javaCode: `
      PrintWriter out    = x.get(PrintWriter.class);

      if ( obj == null ) return;

      var outputterJson = getOutputter(x);
      outputterJson.output(obj);

      // Output the formatted data
      out.println(outputterJson.toString());
      `
    },
    {
      name: 'parseMap',
      args: 'String data',
      type: 'PStream',
      javaCode: `
      StringPStream mapStr = new StringPStream();
      mapStr.setString(data);
      var mapParser = MapParser.instance();
      var ret = mapParser.parse(mapStr, new ParserContextImpl());
      return ret;
      `
    },
    {
      name: 'getOutputter',
      type: 'foam.lib.json.Outputter',
      args: 'Context x',
      javaCode: `
        var out = new foam.lib.json.Outputter(x)
          .setPropertyPredicate(
            new foam.lib.AndPropertyPredicate(x,
              new foam.lib.PropertyPredicate[] {
                new foam.lib.ExternalPropertyPredicate(),
                new foam.lib.NetworkPropertyPredicate(),
                new foam.lib.PermissionedPropertyPredicate()}));

        out.setOutputDefaultValues(true);
        out.setOutputClassNames(true);

        HttpParameters p = x.get(HttpParameters.class);
        if ( p != null && "false".equals(p.getParameter("multiline")) ) {
          out.setMultiLine(false);
        } else {
          out.setMultiLine(true);
        }

        return out;
      `
    }
  ]
});
