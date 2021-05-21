/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.sps',
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
  public static final char START_OF_TEXT = (char) 2;
  public static final char END_OF_TEXT = (char) 3;
  public static final char FIELD_SEPARATOR = (char) 28;
  public static final char RECORD_SEPARATOR = (char) 30;
  public static final char UNIT_SEPARATOR = (char) 31;

  protected List<PropertyInfo> list;

  public ResponsePacket parseSPSResponse(String response) {
    if ( response == null || response.length() == 0 ) {
      return null;
    }

    // remove STX if exist
    if ( response.charAt(0) == START_OF_TEXT ) {
      response = response.substring(1, response.length());
    }

    // remove ETX if exist
    if ( response.charAt(response.length() - 1) == END_OF_TEXT ) {
      response = response.substring(0, response.length() - 1);
    }

    Object[] values = parse(response, FIELD_SEPARATOR);

    for ( int i = 0; i < list.size(); i++ ) {
      list.get(i).set(this, values[i]);
    }

    return this;
  }

  protected Object[] parse(String str, char delimiter) {
    Object[] values;
    StringPStream ps = new StringPStream();
    ps.setString(str);
    Parser parser = new Repeat(new SPSStringParser(delimiter), Literal.create("" + delimiter));
    PStream ps1 = ps.apply(parser, null);
    if ( ps1 == null ) throw new RuntimeException("format error");

    values = (Object[]) ps1.value();

    return values;
  }

  protected static class SPSStringParser implements Parser {
    private char delimiter;
    SPSStringParser(char delimiter) {
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
