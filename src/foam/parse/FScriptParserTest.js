/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse',
  name: 'FScriptParserTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
  'java.text.SimpleDateFormat',
  'foam.core.X',
  'foam.lib.parse.PStream',
  'foam.lib.parse.ParserContext',
  'foam.lib.parse.ParserContextImpl',
  'foam.lib.parse.StringPStream',
  'foam.mlang.predicate.Predicate',
  'foam.nanos.auth.Address',
  'foam.nanos.auth.User',
  'foam.nanos.ruler.Rule',
  'java.util.Date'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
    var user = new User();
    user.setFirstName("senorita");
    user.setMiddleName("senorita");
    user.setLastName("alice");
    var addr = new Address();
    addr.setRegionId("wonderland");
    user.setAddress(addr);

    var parser = new FScriptParser(User.FIRST_NAME);
    StringPStream sps    = new StringPStream();
    PStream ps = sps;
    ParserContext px = new ParserContextImpl();

    sps.setString("firstName==\\"senorita\\"");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "firstName==\\"senorita\\"");
    sps.setString("firstName==\\"kristina2\\"");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");
    sps.setString("thisValue.len==8");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "thisValue.len==8");
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

    sps.setString("userName !exists||firstName !exists");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "sps.setString(\\"userName !exists||firstName !exists\\")");

    sps.setString("firstName==\\"senorita\\"&&firstName.len!=9&&userName !exists||firstName !exists");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "&&firstName.len!=9&&userName !exists||firstName !exists");

    sps.setString("firstName.len!=9&&(userName !exists||firstName !exists)");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "firstName.len!=9&&(userName !exists||firstName !exists)");

    sps.setString("firstName==\\"senorita\\"&&firstName.len!=9&&userName !exists&&firstName !exists");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "&&firstName.len!=9&&userName !exists&&firstName !exists");

    sps.setString("!(firstName==\\"senorita\\"&&firstName.len!=9&&userName !exists&&firstName !exists)");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "&&firstName.len!=9&&userName !exists&&firstName !exists");

    sps.setString("!(firstName~/[0-9]/)");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "!(firstName~/[0-9]/)");

    sps.setString("firstName~/[a-z]/");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "firstName~/[a-z]/");

    sps.setString("address isValid");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "address isValid");

    //TODO: check for no valid - address

    user.setBirthday(new Date(2323223232L));
    var today = new Date();
    var oldDate = new Date(0);

    sps.setString("birthday<" + new SimpleDateFormat("dd-MM-yyyy").format(today));
    test(((Predicate) parser.parse(sps, px).value()).f(user), "birthday<"+today.toString());

    sps.setString("birthday>" + new SimpleDateFormat("dd-MM-yyyy").format(oldDate));
    test(((Predicate) parser.parse(sps, px).value()).f(user), "birthday>"+today.toString());

    sps.setString("emailVerified==false");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "emailVerified==false");

    user.setEmailVerified(true);
    sps.setString("emailVerified==true");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "emailVerified==true");

    sps.setString("phoneNumber==null");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "phoneNumber==null");

    user.setId(666);
    sps.setString("id==666");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "id==666");

    sps.setString("address.regionId==\\"wonderland\\"");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "address.regionId==\\"wonderland\\"");

    sps.setString("address.regionId!=\\"wonder\\"");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "address.regionId!=\\"wonder\\"");

    sps.setString("address.regionId.len==10");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "address.regionId.len==10");

    var sprtCnfg = new foam.nanos.app.SupportConfig();
    var theme = new foam.nanos.theme.Theme();
    sprtCnfg.setSupportAddress(addr);
    theme.setSupportConfig(sprtCnfg);
    parser = new FScriptParser(foam.nanos.theme.Theme.SUPPORT_CONFIG);

    sps.setString("supportConfig.supportAddress.regionId!=supportConfig.supportAddress.countryId");
    test(((Predicate) parser.parse(sps, px).value()).f(theme), "supportConfig.supportAddress.regionId!=supportConfig.supportAddress.countryId");
    sps.setString("supportConfig.supportAddress.regionId==\\"wonderland\\"");
    test(((Predicate) parser.parse(sps, px).value()).f(theme), "supportConfig.supportAddress.regionId==\\"wonderland\\"");

    var rule = new Rule();
    parser = new FScriptParser(foam.nanos.ruler.Rule.OPERATION);
    rule.setOperation(foam.nanos.dao.Operation.CREATE);
    sps.setString("operation==\\"create\\"");
    test(((Predicate) parser.parse(sps, px).value()).f(rule), "operation==\\"create\\"");
    `
    }
  ]
});
