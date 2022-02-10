package foam.parse;
import foam.core.X;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.StringPStream;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.parse.FScriptParser;

public class FScriptParserTest extends foam.nanos.test.Test {

  @Override
  public void runTest(X x) throws Throwable {
    var user = new User();
    user.setFirstName("kristina");
    user.setMiddleName("kristina");
    user.setLastName("perez");
    var addr = new Address();
    addr.setRegionId("region1");
    user.setAddress(addr);

    var parser = new FScriptParser(User.FIRST_NAME);
    StringPStream sps    = new StringPStream();
    PStream ps = sps;
    ParserContext px = new ParserContextImpl();

    sps.setString("firstName==\"kristina\"");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina returns true");
    sps.setString("firstName==\"kristina2\"");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");
    sps.setString("thisValue_len==8");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina returns true");
    sps.setString("firstName_len!=9");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");
    sps.setString("firstName_len>9");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");
    sps.setString("firstName_len<8");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");
    sps.setString("thisValue_len>=8");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");
    sps.setString("firstName==lastName");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");
    sps.setString("firstName==middleName");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");
    sps.setString("firstName exists");
    test(((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");
    sps.setString("firstName !exists");
    test(! ((Predicate) parser.parse(sps, px).value()).f(user), "quoted string kristina2 returns false");

  }
}
