/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse',
  name: 'FScriptParserTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
  'foam.core.X',
  'foam.lib.parse.PStream',
  'foam.lib.parse.ParserContext',
  'foam.lib.parse.ParserContextImpl',
  'foam.lib.parse.StringPStream',
  'foam.mlang.predicate.Predicate',
  'foam.nanos.auth.Address',
  'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
    var user = new User();
    user.setFirstName("senorita");
    user.setMiddleName("kristina");
    user.setLastName("perez");
    var addr = new Address();
    addr.setRegionId("region1");
    user.setAddress(addr);

    var parser = new FScriptParser(User.FIRST_NAME);
    StringPStream sps    = new StringPStream();
    PStream ps = sps;
    ParserContext px = new ParserContextImpl();

//    sps.setString("firstName==\"senorita\"");
//    test(((Predicate) parser.parse(sps, px).value()).f(user), "firstName==\\"senorita\\"");
//    sps.setString("firstName==\"kristina2\"");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");
    sps.setString("thisValue.len==8");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "thisValue.len==8e");
    sps.setString("firstName.len!=9");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "firstName.len!=9");
    sps.setString("firstName.len>9");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "firstName.len>9");
    sps.setString("firstName.len<8");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "firstName.len<8");
    sps.setString("thisValue.len>=8");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "thisValue.len>=8");
    sps.setString("firstName==lastName");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "firstName==lastName");
    sps.setString("firstName==middleName");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "firstName==middleName");
    sps.setString("firstName exists");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "firstName exists");
    sps.setString("firstName !exists");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "firstName !exists");
      `
    },
    {
      name: 'isValid',
      type: 'Boolean',
      args : [
        { name: 'query',type: 'String' },
        { name: 'statement',type: 'String' }
      ],
      javaCode: `
        QueryParser parser = new QueryParser(User.getOwnClassInfo());

    StringPStream sps = new StringPStream();
    sps.setString(query);
    PStream ps = sps;
    ParserContext x = new ParserContextImpl();
    ps = parser.parse(ps, x);
    if (ps == null)
      return false;

    Predicate result = (foam.mlang.predicate.Nary) ps.value();
    result = result.partialEval();

    return statement.equalsIgnoreCase(result.createStatement()) ? true : false;
        `
    },
  ]
});
