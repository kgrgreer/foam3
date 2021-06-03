/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.token',
  name: 'AbstractTokenService',
  abstract: true,

  documentation: 'Abstract implementation of Token Service',

  implements: [
    'foam.nanos.auth.token.TokenService'
  ],

  javaImports: [
     'foam.dao.DAO',
     'foam.nanos.auth.token.Token',
     'java.util.Calendar',
     'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'generateExpiryDate',
      type: 'Date',
      javaCode:
`Calendar calendar = Calendar.getInstance();
calendar.add(java.util.Calendar.DAY_OF_MONTH, 1);
return calendar.getTime();`
    },
    {
      name: 'generateToken',
      javaCode: `return this.generateTokenWithParameters(x, user, null);`
    },
    {
      name: 'isTokenValid',
      javaCode: `
        DAO tokenDAO = (DAO) x.get("localTokenDAO");
        Token tokenResult = (Token) tokenDAO.find(EQ(Token.DATA, token));

        if ( tokenResult == null )
          return false;

        if ( tokenResult.getProcessed() )
          return false;

        return true;
      `
    }
  ]
});
