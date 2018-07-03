foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'ParsePacket',
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
public void parseSPSResponse(String response) throws IllegalAccessException, InstantiationException{
  //String[] temp = response.split("");
  ClassInfo classInfo = classInfo_;
  System.out.println("aaa");
  if ( response == null ) {
  }
  
  Object[] values;
  
  response = response.substring(1, response.length() - 1 );
  char delimiter = (char) 28;
  
  StringPStream ps = new StringPStream();
  ps.setString(response);
  Parser parser = new Repeat(new SPSStringParser(), new Literal("" + delimiter));
  PStream ps1 = ps.apply(parser, null);
  System.out.println("bbb");
  if ( ps1 == null ) throw new RuntimeException("format error");
  System.out.println("ccc");
  
  values = (Object[]) ps1.value();
  
  System.out.println("list size = " + list.size());
  System.out.println("values length = " + values.length);

  if ( values.length == list.size() ) {
    for ( int i = 0; i < list.size(); i++ ) {
      // System.out.println(values[i]);
      ((PropertyInfo)list.get(i)).set(this, ((PropertyInfo)list.get(i)).fromString((String) values[i]));
     }
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
