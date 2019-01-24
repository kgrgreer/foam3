foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'FilterDeletedUserDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO decorator which filters out deleted user.',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ProxySink',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
  ],

  constants: [
    {
      name: 'READ_PERMISSION',
      type: 'String',
      value: 'user.read.deleted'
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        return read(x, super.find_(x, id));
      `
    },
    {
      name: 'select_',
      javaCode: `
        if (sink != null) {
          super.select_(x, new FilterDeletedUserSink(x, sink, this), skip, limit, order, predicate);
          return sink;
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'read',
      javaReturns: 'User',
      args: [
        { of: 'foam.core.X', name: 'x' },
        { of: 'foam.core.FObject', name: 'obj' }
      ],
      javaCode: `
        User result = (User) obj;
        AuthService auth = (AuthService) x.get("auth");
        if ( result != null
          && result.getDeleted()
          && ! auth.check(x, READ_PERMISSION)
        ) {
          return null;
        }
        return result;
      `
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'FilterDeletedUserSink',

  javaImports: [
    'foam.core.FObject'
  ],

  extends: 'foam.dao.ProxySink',

  methods: [
    {
      name: 'put',
      javaCode: `
        FObject result = dao.read(getX(), (FObject) obj);
        if ( result != null ) {
          super.put(result, sub);
        }
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private FilterDeletedUserDAO dao;
          public FilterDeletedUserSink(foam.core.X  x, foam.dao.Sink delegate, FilterDeletedUserDAO dao) {
            setX(x);
            setDelegate(delegate);
            this.dao = dao;
          }
        `);
      }
    }
  ]
});
