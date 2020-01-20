foam.CLASS({
  package: 'net.nanopay.liquidity.ruler',
  name: 'IsSystemOrAdminUser',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if the current user is a system or admin user.',

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        User user = (User) ((X) obj).get("user");
        return user != null
          && ( user.getId() == User.SYSTEM_USER_ID
            || user.getGroup().equals("admin")
            || user.getGroup().equals("system") );
      `
    }
  ]
});
