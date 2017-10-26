foam.CLASS({
  package: 'net.nanopay.auth.email',
  name: 'EmailTokenService',
  extends: 'net.nanopay.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for verifying email addresses',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ListSink',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'net.nanopay.auth.token.Token',
    'java.util.Calendar',
    'java.util.List'
  ],

  methods: [
    {
      name: 'processToken',
      javaCode:
`if ( ! super.processToken(user, token) ) {
  return false;
}

try {
  // set user email verified to true
  DAO userDAO = (DAO) getX().get("userDAO");
  user.setEmailVerified(true);
  userDAO.put(user);
  return true;
} catch (Throwable t) {
  t.printStackTrace();
  return false;
}`
    }
  ]
});
