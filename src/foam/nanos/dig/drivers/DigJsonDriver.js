/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.drivers',
  name: 'DigJsonDriver',
  extends: 'foam.nanos.dig.drivers.DigFormatDriver',
  flags: ['java'],

  javaImports: [
    'foam.core.*',
    'foam.dao.DAO',
    'foam.lib.csv.CSVOutputter',
    'foam.lib.json.OutputterMode',
    'foam.lib.json.JSONParser',
    'foam.lib.json.MapParser',
    'foam.nanos.auth.Group',
    'foam.nanos.boot.NSpec',
    'foam.nanos.dig.*',
    'foam.nanos.dig.exception.*',
    'foam.nanos.http.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.util.SafetyUtil',
    'java.io.PrintWriter',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'java.util.Map',
    'java.util.Set',
    'javax.servlet.http.HttpServletResponse',
    'foam.lib.parse.PStream',
    'foam.lib.parse.ParserContextImpl',
    'foam.lib.parse.StringPStream'
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

      boolean isAdmin = ((Group)x.get("group")).getId().equals("admin") || ((Group)x.get("group")).getId().equals("system");
      if ( isAdmin && x.get(HttpParameters.class).getParameter("nameMapping") != null ) {
        StringPStream mapStr = new StringPStream();
        mapStr.setString(x.get(HttpParameters.class).getParameter("nameMapping"));
        var mapParser = MapParser.instance();
        var ret = mapParser.parse(mapStr, new ParserContextImpl());
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

      if ( isAdmin && x.get(HttpParameters.class).getParameter("fieldValue") != null ) {
        StringPStream mapStr = new StringPStream();
        mapStr.setString(x.get(HttpParameters.class).getParameter("fieldValue"));
        var mapParser = MapParser.instance();
        var ret = mapParser.parse(mapStr, new ParserContextImpl());
        if ( ret.value() != null && ((Map)ret.value()).size() != 0 ) {
          Map map = (Map)ret.value();
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

      return list;
      `
    },
    {
      name: 'outputFObjects',
      javaCode: `
      PrintWriter out = x.get(PrintWriter.class);
      ClassInfo cInfo = dao.getOf();
      String output = null;

      if ( fobjects == null || fobjects.size() == 0 ) {
        out.println("[]");
        return;
      }

      foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(x)
        .setPropertyPredicate(
          new foam.lib.AndPropertyPredicate(x,
            new foam.lib.PropertyPredicate[] {
              new foam.lib.ExternalPropertyPredicate(),
              new foam.lib.NetworkPropertyPredicate(),
              new foam.lib.PermissionedPropertyPredicate()}));

      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);
      outputterJson.setMultiLine(true);

      if ( fobjects.size() == 1 )
        outputterJson.output(fobjects.get(0));
      else
        outputterJson.output(fobjects.toArray());

      // Output the formatted data
      out.println(outputterJson.toString());
      `
    }
  ]
});
