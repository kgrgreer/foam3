/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'TemplateString',
  extends: 'foam.mlang.AbstractExpr',
  javaImports: [
    'foam.lib.parse.*',
    'foam.core.AbstractStringPropertyInfo',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'java.util.ArrayList'
  ],
  properties: [
    {
      class: 'String',
      name: 'string',
      documentation: "TODO"
    },
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Parser',
      name: 'parser',
      documentation: `the syntax for a JSON is "fieldname": value. The grammar finds all the occurrences of fieldnames in
        a JSON formatted string and replaces them with alternative field name provided in the map`,
      javaFactory: `
      return new Seq1(0,
       new Repeat(
         new Seq1(1, new Until(Literal.create("{{")), new Repeat(new foam.lib.parse.Not(Literal.create("}}"), AnyChar.instance()))
         ), Literal.create("}}"), 1),
       Literal.create("}}"),
       new Optional(new Repeat(AnyChar.instance()))
     );
      `
    }
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
      var fobj = (FObject) obj;
      var templparse = getParser();
      StringPStream ps = new StringPStream();
      ps.setString(getString());
      var psRet = ps.apply(templparse, null);
      if ( psRet == null ) return null;
      var axiomsArr = (Object[]) psRet.value();
      var axioms = new ArrayList<PropertyInfo>();
      for ( Object a : axiomsArr ) {
        Object[] arr = (Object[]) a;
        StringBuilder sb = new StringBuilder();
        for ( Object num: arr ) {
          sb.append(num);
        }
        var p = (PropertyInfo) fobj.getClassInfo().getAxiomByName(sb.toString());
        if ( p == null || !( p instanceof AbstractStringPropertyInfo ) ) return null;
        axioms.add((PropertyInfo)fobj.getClassInfo().getAxiomByName(sb.toString()));
      }
      String ret = getString();
      for ( PropertyInfo prop : axioms ) {
        ret = ret.replace("{{"+prop.getName()+"}}", (String) prop.f(obj));
      }

      return ret;
      `
    }
  ]
});
