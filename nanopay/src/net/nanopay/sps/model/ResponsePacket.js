foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'ResponsePacket',
  abstract: true,

  javaImports: [
    'java.util.*',
    'foam.core.*',
    'foam.lib.parse.*',
    'foam.util.SafetyUtil'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
protected static List<PropertyInfo> list;
public void parseSPSResponse(String response) {
  if ( response == null || response.length() == 0 ) {
    return;
  }
  
  Object[] values;
  
  response = response.substring(1, response.length() - 1 );
  char delimiter = (char) 28;
  
  StringPStream ps = new StringPStream();
  ps.setString(response);
  Parser parser = new Repeat(new SPSStringParser(), new Literal("" + delimiter));
  PStream ps1 = ps.apply(parser, null);
  if ( ps1 == null ) throw new RuntimeException("format error");
  
  values = (Object[]) ps1.value();
  
  for ( int i = 0; i < list.size(); i++ ) {
    list.get(i).set(this, list.get(i).fromString((String) values[i]));
  }
}

private static class SPSStringParser implements Parser {
  private static char delimiter = (char) 28;
  public SPSStringParser() {}

  public PStream parse(PStream ps, ParserContext x) {
    if ( ps == null ) {
      return null;
    }

    char head;
    StringBuilder sb = new StringBuilder();

    while ( ps.valid() ) {
      head = ps.head();
      if ( head == delimiter ) {
        break;
      }
      sb.append(head);
      ps = ps.tail();
    }

    if ( ! ps.valid() && SafetyUtil.isEmpty(sb.toString()) ) {
      return null;
    }

    return ps.setValue(sb.toString());
  }
}        
`);
      }
    }
  ],
});
