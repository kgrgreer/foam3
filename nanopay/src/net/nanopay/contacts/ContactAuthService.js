foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'ContactAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'Prevents users of type "Contact" from logging in.',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'localUserDAO'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.User',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.NanoService',
    'foam.util.SafetyUtil',
    'java.util.List',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.NEQ',
    'static foam.mlang.MLang.AND'
  ],

  methods: [
    {
      name: 'start',
      javaCode:
`if ( getDelegate() instanceof NanoService ) {
  ((NanoService) getDelegate()).start();
}`
    },
    {
      name: 'login',
      javaCode:
`User user = (User) ((DAO) getLocalUserDAO()).find(userId);
if ( user != null && SafetyUtil.equals(user.getType(), "Contact") ) {
  throw new AuthenticationException("Contacts cannot log in.");
}
return getDelegate().login(x, userId, password);`
    },
    {
      name: 'loginByEmail',
      javaCode:
`Sink sink = new ArraySink();
sink = ((DAO) getLocalUserDAO())
  .where(AND(EQ(User.EMAIL, email.toLowerCase()), NEQ(User.TYPE, "Contact")))
  .limit(1)
  .select(sink);
List data = ((ArraySink) sink).getArray();
if ( data == null || data.size() != 1 ) {
  throw new AuthenticationException("User not found");
}
return getDelegate().loginByEmail(x, email, password);`
    }
  ]
});
