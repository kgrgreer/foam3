/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse.test',
  name: 'FScriptParserTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
  'java.text.SimpleDateFormat',
  'foam.core.X',
  'foam.lib.parse.PStream',
  'foam.lib.parse.ParserContext',
  'foam.lib.parse.ParserContextImpl',
  'foam.lib.parse.StringPStream',
  'foam.mlang.Constant',
  'foam.mlang.predicate.Predicate',
  'foam.mlang.Expr',
  'foam.nanos.auth.Address',
  'foam.nanos.auth.User',
  'foam.nanos.ruler.Rule',
  'foam.parse.FScriptParser',
  'java.util.Date'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
    var user = new User();
    user.setId(100L);
    user.setFirstName("marmelad");
    user.setMiddleName("marmelad");
    user.setLastName("sonya");
    user.setOrganization("name-with-dashes");
    var addr = new Address();
    addr.setRegionId("CA-ON");


    var parser = new FScriptParser(User.FIRST_NAME);
    StringPStream sps    = new StringPStream();
    PStream ps = sps;
    ParserContext px = new ParserContextImpl();
    sps.setString("address==null");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "address==null");
    user.setAddress(addr);

    sps.setString("firstName==\\"marmelad\\"");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "firstName==\\"marmelad\\"");
    sps.setString("firstName==\\"kristina2\\"");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");
    sps.setString("thisValue.len==8");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "thisValue.len==8");

    sps.setString("thisValue.len == 8");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "whitespace test: thisValue.len == 8");

    sps.setString("thisValue.len ==8");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "whitespace test: thisValue.len ==8");

    sps.setString("thisValue.len== 8");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "whitespace test: thisValue.len== 8");

    sps.setString("thisValue.len== 8 && thisValue.len > 5");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "thisValue.len== 8 && thisValue.len > 5");

    sps.setString("thisValue.len== 9 || thisValue.len > 5");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "thisValue.len== 9 || thisValue.len > 5");

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

    sps.setString("firstName==\\"marmelad\\"&&firstName.len!=9&&userName !exists||firstName !exists");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "&&firstName.len!=9&&userName !exists||firstName !exists");

    sps.setString("firstName.len!=9&&(userName !exists||firstName !exists)");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "firstName.len!=9&&(userName !exists||firstName !exists)");

    sps.setString("firstName==\\"marmelad\\"&&firstName.len!=9&&userName !exists&&firstName !exists");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "&&firstName.len!=9&&userName !exists&&firstName !exists");

    sps.setString("firstName==\\"marmelad\\"&&firstName.len==9||firstName.len==8");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "&&firstName.len!=9&&userName !exists&&firstName !exists");

    sps.setString("!(firstName==\\"marmelad\\"&&firstName.len!=9&&userName !exists&&firstName !exists)");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "&&firstName.len!=9&&userName !exists&&firstName !exists");

    sps.setString("!(firstName~/[0-9]/)");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "!(firstName~/[0-9]/)");

    sps.setString("firstName~/[a-z]+/");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "firstName~/[a-z]+/");

    sps.setString("organization exists");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "organization exists");

    sps.setString("organization==\\"name-with-dashes\\"");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "organization==\\"name-with-dashes\\"");

    sps.setString("address isValid");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "!address isValid");

    sps.setString("4+7");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==11, "4+7");

    sps.setString("id+lastName.len");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==105, "id+lastname=105");

    sps.setString("firstName.len+lastName.len==13");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "firstName.len+lastName.len=13");

    sps.setString("MAX(firstName.len,lastName.len)+5 == 13");
    test((((Predicate) parser.parse(sps, px).value()).f(user)), "MAX(firstName.len,lastName.len)+5 == 13");

    sps.setString("2+ MIN(firstName.len,lastName.len) == 7");
    test((((Predicate) parser.parse(sps, px).value()).f(user)), "2+ MIN(firstName.len,lastName.len) == 7");

    sps.setString("10 + MAX(firstName.len,MAX(lastName.len+4, 7)) == 19");
    test((((Predicate) parser.parse(sps, px).value()).f(user)), "M10 + MAX(firstName.len,MAX(lastName.len+4, 7)) == 19");

    sps.setString("10 + MIN(firstName.len,MAX(lastName.len+4, 7)) == 18");
    test((((Predicate) parser.parse(sps, px).value()).f(user)), "M10 + MAX(firstName.len,MAX(lastName.len+4, 7)) == 19");

    sps.setString("4+7+2");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==13, "13");

    sps.setString("4+7-2");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==9, "9");

    sps.setString("4+7*2");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==18, "18");

    sps.setString("id*lastName.len");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==500, "id*lastname.len=500");

    sps.setString("unknown*lastName.len");
    test(parser.parse(sps, px) == null, "unknown+lastname.len=null");

    sps.setString("4+7/7");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==5, "5");

    sps.setString("4+7/7*8/4*2*3");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==16, "16");

    sps.setString("50/10-2");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==3, "3");

    sps.setString("2*8-6");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==10, "10");

    sps.setString("2 * 8 - 6");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==10, "10");

    sps.setString("2 * 8 - MAX(6,10)");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==6, "6");

    sps.setString("MAX(firstName.len,lastName.len)");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==8, "MAX(firstname.len,lastname.len)=8");

    sps.setString("2 * 8 - MIN(6,10)");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==10, "10");

    sps.setString("MIN(id,firstName.len)");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==8, "MIN(id,lastname.len)=8");

    double ans = 2.2*3-1;
    sps.setString("2.2*3-1");
    test(((Double)((Expr) parser.parse(sps, px).value()).f(user))==ans, "double: 5.6");

    addr.setCountryId("CA");
    addr.setCity("Toronto");
    addr.setPostalCode("m5v0j8");
    addr.setStreetName("sesame");
    addr.setStreetNumber("ed");
    addr.setRegionId("CA-ON");

    sps.setString("address isValid");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "address isValid");

    //TODO: check for no valid - address

    user.setBirthday(new Date(2323223232L));
    var today = new Date();
    var oldDate = new Date(0);

    sps.setString("birthday<" + new SimpleDateFormat("yyyy-MM-dd").format(today));
    test(((Predicate) parser.parse(sps, px).value()).f(user), "birthday<"+today.toString());

    sps.setString("birthday>" + new SimpleDateFormat("yyyy-MM-dd").format(oldDate));
    test(((Predicate) parser.parse(sps, px).value()).f(user), "birthday>"+today.toString());

    sps.setString("emailVerified==false");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "emailVerified==false");

    user.setEmailVerified(true);
    sps.setString("emailVerified==true");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "emailVerified==true");

    user.setId(666);
    sps.setString("id==666");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "id==666");

    sps.setString("address.regionId==\\"CA-ON\\"");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "address.regionId==\\"CA-ON\\"");

    sps.setString("address.regionId!=\\"wonderland\\"");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "address.regionId!=\\"wonderland\\"");

    sps.setString("address.regionId.len==5");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "address.regionId.len==5");

    sps.setString("if(id exists){id}else{0}");
    test(Double.valueOf(((Expr) parser.parse(sps, px).value()).f(user).toString())==666, "if(id exists){id}else{0} -> 666");

    // sps.setString("if(unknown !exists){999}else{0}");
    // test(Double.valueOf(((Expr) parser.parse(sps, px).value()).f(user).toString())==999, "if(unknown==null){999}else{0} -> 999");

    Object result = null;
    sps.setString("if(address.regionId.len==5){firstName}else{lastName.len+3}");
    result = ((Expr) parser.parse(sps, px).value()).f(user);
    test("marmelad".equals(result.toString()), "if(address.regionId.len==5){firstName}else{lastName.len==3}");

    sps.setString("if ( address.regionId.len==4 ) { firstName } else { lastName.len+3 }");
    result = ((Expr) parser.parse(sps, px).value()).f(user);
    test(((Double) result) == 8, "if ( address.regionId.len==5 ) { firstName } else { lastName.len==3 }");

    sps.setString("if ( address.regionId.len==4 ) { firstName } else { if ( lastName.len+3==10 ) { address.regionId } else { address.city } }");
    result = ((Expr) parser.parse(sps, px).value()).f(user);
    test("Toronto".equals(result.toString()), "if ( address.regionId.len==4 ) { firstName } else { if ( lastName.len+3==10 ) { address.regionId } else { address.city } }"+result.toString()+" class "+result.getClass().getName());

    sps.setString("address instanceof foam.nanos.auth.Address");
    test(( ((Predicate) parser.parse(sps, px).value()).f(user)), "address instance foam.nanos.auth.Address");

    sps.setString("!(address instanceof foam.nanos.auth.User)");
    test(( ((Predicate) parser.parse(sps, px).value()).f(user)), "!(address instanceof foam.nanos.auth.User)");

    sps.setString("address instanceof foam.nanos.auth.Address");
    test(( ((Predicate) parser.parse(sps, px).value()).f(user)), "address instance foam.nanos.auth.Address");

    sps.setString("SYSTEM_USER_ID==1");
    test(( ((Predicate) parser.parse(sps, px).value()).f(user)), "SYSTEM_USER_ID==1");
    sps.setString("let testVar = 4+7; address.regionId.len<testVar");
    test(( ((Predicate) parser.parse(sps, px).value()).f(user)), "let testVar = 4+7; address.regionId.len<testVar");

    sps.setString("let newVar = address.regionId.len; address.regionId.len==newVar");
    test(( ((Predicate) parser.parse(sps, px).value()).f(user)), "let testVar2 = address.regionId.len; address.regionId.len==testVar");


    var sprtCnfg = new foam.nanos.app.SupportConfig();
    var theme = new foam.nanos.theme.Theme();
    sprtCnfg.setSupportAddress(addr);
    theme.setSupportConfig(sprtCnfg);
    parser = new FScriptParser(foam.nanos.theme.Theme.SUPPORT_CONFIG);

    sps.setString("supportConfig.supportAddress.regionId!=supportConfig.supportAddress.countryId");
    test(((Predicate) parser.parse(sps, px).value()).f(theme), "supportConfig.supportAddress.regionId!=supportConfig.supportAddress.countryId");
    sps.setString("supportConfig.supportAddress.regionId==\\"CA-ON\\"");
    test(((Predicate) parser.parse(sps, px).value()).f(theme), "supportConfig.supportAddress.regionId==\\"CA-ON\\"");
    sps.setString("supportConfig.supportAddress instanceof foam.nanos.auth.Address");
    test(((Predicate) parser.parse(sps, px).value()).f(theme), "supportConfig.supportAddress instanceof oam.nanos.auth.Address");

    var rule = new Rule();
    parser = new FScriptParser(foam.nanos.ruler.Rule.OPERATION);
    rule.setOperation(foam.nanos.dao.Operation.CREATE);
    sps.setString("thisValue==foam.nanos.dao.Operation.CREATE");
    test(((Predicate) parser.parse(sps, px).value()).f(rule), "thisValue==foam.nanos.dao.Operation.CREATE");
    sps.setString("instanceof foam.nanos.ruler.Rule");
    test(((Predicate) parser.parse(sps, px).value()).f(rule), "thisValue instanceof foam.nanos.ruler.Rule");
    `
    }
  ]
});
