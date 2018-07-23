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
public ResponsePacket parseSPSResponse(String response) {
  if ( response == null || response.length() == 0 ) {
    return null;
  }
  
  //response = response.substring(1, response.length() - 1 );
  
  if ( response.charAt(0) == (char) 2 ) {
    response = response.substring(1, response.length());
  }
  
  if ( response.charAt(response.length() - 1) == (char) 3 ) {
    response = response.substring(0, response.length() - 1);
  }
  
  char fieldSeparator = (char) 28;
  Object[] values = parse(response, fieldSeparator);
  System.out.println("values: " + Arrays.toString(values));
 
  for ( int i = 0; i < list.size(); i++ ) {
    //list.get(i).set(this, values[i]);
    list.get(i).set(this, list.get(i).fromString((String) values[i]));
  }
  
  return this;
}

protected Object[] parse(String str, char delimiter) {
  Object[] values;
  StringPStream ps = new StringPStream();
  ps.setString(str);
  Parser parser = new Repeat(new SPSStringParser(delimiter), new Literal("" + delimiter));
  PStream ps1 = ps.apply(parser, null);
  if ( ps1 == null ) throw new RuntimeException("format error");

  values = (Object[]) ps1.value();

  return values;
}

protected static class SPSStringParser implements Parser {
  private char delimiter;
  public SPSStringParser(char delimiter) {
    this.delimiter = delimiter;
  }

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
