foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'FilterDeletedUserDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.util.Auth',
    'java.util.List',
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        setUp(x);

        FilterDeletedUserDAOTest_find_deleted_user_returns_null();
        FilterDeletedUserDAOTest_select_does_not_include_deleted_users();
      `
    },
    {
      name: 'setUp',
      args: [
        { of: 'X', name: 'x' }
      ],
      javaCode: `
        dao_ = (DAO) x.get("localUserDAO");

        active_ = (User) dao_.find(MLang.EQ(User.EMAIL, "testuser@nanopay.net"));
        if ( active_ == null ) {
          active_ = new User.Builder(x)
            .setEmail("testuser@nanopay.net")
            .build();
        }
        active_ = (User) dao_.put(active_);

        deleted_ = (User) dao_.find(MLang.EQ(User.EMAIL, "deleteduser@nanopay.net"));
        if ( deleted_ == null ) {
          deleted_ = new User.Builder(x)
            .setEmail("deleteduser@nanopay.net")
            .setDeleted(true)
            .build();
        }
        deleted_ = (User) dao_.put(deleted_);

        userX_ = Auth.sudo(x, active_);
      `
    },
    {
      name: 'FilterDeletedUserDAOTest_find_deleted_user_returns_null',
      javaCode: `
        FObject found = dao_.inX(userX_).find(active_.getProperty("id"));
        FObject notFound = dao_.inX(userX_).find(deleted_.getProperty("id"));

        test(found != null && notFound == null, "FilterDeletedUserDAO.find deleted user returns null");
      `
    },
    {
      name: 'FilterDeletedUserDAOTest_select_does_not_include_deleted_users',
      javaCode: `
        ArraySink sink = (ArraySink) dao_.inX(userX_).select(new ArraySink());
        List array = sink.getArray();

        test(
          array.contains(active_) && ! array.contains(deleted_)
          , "FilterDeletedUserDAO.select does not include deleted users"
        );
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          private X userX_;
          private DAO dao_;
          private User active_;
          private User deleted_;
        `);
      }
    }
  ]
});
