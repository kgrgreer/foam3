foam.CLASS({
  package: 'net.nanopay.auth.email',
  name: 'PreventDuplicateEmailDAO',

  documentation: 'DAO decorator that prevents putting a user with the same email',

  javaImports: [
    'net.nanopay.model.Business',
    'net.nanopay.contacts.Contact',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*',
    'foam.mlang.sink.Count',
    'foam.util.Email',
    'foam.util.SafetyUtil',
  ],

  extends: 'foam.dao.ProxyDAO',

  methods: [
    {
      name: 'put_',
      javaCode: `
  // TODO: Rather than do this, just move this decorator to localUserUserDAO.
  if ( obj instanceof Business || obj instanceof Contact ) {
    return super.put_(x, obj);
  }

  User newUser = (User) obj;
  User oldUser = (User) getDelegate().find(newUser.getId());
  boolean emailChanged = oldUser == null || ! SafetyUtil.equals(newUser.getEmail(), oldUser.getEmail());

  if ( ! emailChanged || SafetyUtil.isEmpty(newUser.getEmail()) ) {
    return super.put_(x, obj);
  }

  DAO userUserDAO = ((DAO) x.get("userUserDAO")).inX(x);
  Boolean emailIsTaken = userUserDAO.find(
    AND(
      EQ(User.EMAIL, newUser.getEmail()),
      NEQ(User.ID, newUser.getId())
    )
  ) != null;

  if ( emailIsTaken ) {
    throw new RuntimeException("User with same email address already exists: " + newUser.getEmail());
  }

  return super.put_(x, obj);
      `,
   }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public PreventDuplicateEmailDAO(foam.core.X x, foam.dao.DAO delegate) {
  super(x, delegate);
}
        `);
      },
    },
  ],
});
