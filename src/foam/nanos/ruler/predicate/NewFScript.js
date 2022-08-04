/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'NewFScript',

  documentation: `A predicate that runs an FScript on the NEW object`,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'foam.lib.parse.PStream',
    'foam.lib.parse.ParserContext',
    'foam.lib.parse.ParserContextImpl',
    'foam.lib.parse.StringPStream',
    'foam.parse.FScriptParser',
    'static foam.mlang.MLang.*'
  ],
  properties: [
    {
      class: 'String',
      name: 'query'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        var nu = (FObject) NEW_OBJ.f(obj);
        FScriptParser parser = new FScriptParser(nu.getClassInfo());
        StringPStream sps = new StringPStream();
        sps.setString(getQuery());
        ParserContext x = new ParserContextImpl();
        PStream ps = parser.parse(sps, x);
        if ( ps == null ) {
          throw new RuntimeException("FScript failed in rule predicate");
        }
        return ((foam.mlang.predicate.Nary) ps.value()).f(nu);
      `
    }
  ]
});
