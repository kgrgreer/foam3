/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse',
  name: 'QueryParserTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
  'foam.lib.parse.PStream',
  'foam.lib.parse.ParserContext',
  'foam.lib.parse.ParserContextImpl',
  'foam.lib.parse.StringPStream',
  'foam.nanos.auth.User',
  'foam.mlang.predicate.Nary',
  'foam.mlang.predicate.Predicate'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode:`
      var user = new User();
      user.setFirstName("kristina");
      user.setLastName("smirnova");
      test(testQuery("firstName = \\"kristina\\" and lastName=smirnova", user), "user's firstName = kristina, lastName = smirnova");
      `
    },
    {
      name: 'testQuery',
      type: 'Boolean',
      args: [ { class: 'String', name: 'query'}, { type: 'foam.core.FObject', name: 'obj'} ],
      javaCode: `
      var parser = new QueryParser(obj.getClassInfo());
      var sps = new StringPStream();
      PStream       ps = sps;
      sps.setString(query);
      ParserContext px = new ParserContextImpl();
      ps = parser.parse(ps, px);
      return ((Predicate) ps.value()).f(obj);
      `
    }
  ]
});
