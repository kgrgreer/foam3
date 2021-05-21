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
  package: 'net.nanopay.security',
  name: 'HashedJSONParser',
  extends: 'foam.lib.json.JSONParser',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.lib.json.ExprParser',
    'foam.lib.json.JSONParser',
    'foam.lib.parse.Parser',
    'foam.lib.parse.ParserContext',
    'foam.lib.parse.ParserContextImpl',
    'foam.lib.parse.StringPStream',
  ],

  properties: [
    {
      name: 'messageDigest',
      class: 'FObjectProperty',
      of: 'net.nanopay.security.MessageDigest'
    },
    {
      name: 'digestRequired',
      class: 'Boolean'
    },
    {
      name: 'parser',
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Parser',
      javaFactory: `
      return new HashedFObjectParser(getMessageDigest(), getDigestRequired());
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected Parser         parser   = ExprParser.instance();
  protected StringPStream stringps = new StringPStream();

  public FObject parseString(String data, Class defaultClass) {
    StringPStream ps = stringps;

    ps.setString(data);
    ParserContext x = new ParserContextImpl();
    x.set("X", getX());

    ps = (StringPStream) ps.apply(defaultClass == null ?
                                  getParser() :
                                  new HashedFObjectParser(getMessageDigest(), defaultClass, getDigestRequired()), x);

    return ps == null ? null : (FObject) ps.value();
  }
       `
        }));
      }
    }
  ]
});
