foam.CLASS({
  package: 'net.nanopay.partners',
  name: 'AuthenticatedUserUserJunctionDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    Authenticate any junction DAO created by a relationship between two users.

    Features:
      only allow access to records where the user id matches the source or
      target id of the record    
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.*',
   
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR'
  ],

  messages: [
    { name: 'NULL_ENTITY_ERROR_MSG', message: 'Entity is null' }
  ],

  properties: [
    {
      class: 'String',
      name: 'createPermission_'
    },
    {
      class: 'String',
      name: 'updatePermission_'
    },
    {
      class: 'String',
      name: 'removePermission_'
    },
    {
      class: 'String',
      name: 'readPermission_'
    },
    {
      class: 'String',
      name: 'deletePermission_'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AuthenticatedUserUserJunctionDAO(X x, String name, DAO delegate) {
            super(x, delegate);
            setCreatePermission_(name + ".create.*");
            setUpdatePermission_(name + ".update.*");
            setRemovePermission_(name + ".remove.*");
            setReadPermission_(name + ".read.*");
            setDeletePermission_(name + ".delete.*");
          }    
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'checkOwnership',
      type: 'Void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'FObject', name: 'obj' },
        { type: 'String', name: 'permission' }
      ],
      javaCode: `
        User user = getUser(x);
        AuthService auth = (AuthService) x.get("auth");
        UserUserJunction entity = (UserUserJunction) obj;

        if ( entity == null ) {
          throw new RuntimeException(NULL_ENTITY_ERROR_MSG);
        }

        boolean hasPermission = auth.check(x, permission);

        boolean ownsObject =
            user.getId() == (long) entity.getSourceId() ||
            user.getId() == (long) entity.getTargetId();

        if ( ! hasPermission && ! ownsObject) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'getFilteredDAO',
      type: 'DAO',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'String', name: 'permission' }
      ],
      javaCode: `
        User user = getUser(x);
        AuthService auth = (AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return getDelegate();
        return getDelegate().where(OR(
          EQ(UserUserJunction.SOURCE_ID, user.getId()),
          EQ(UserUserJunction.TARGET_ID, user.getId())));
      `
    },
    {
      name: 'getUser',
      type: 'User',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null ) {
          throw new AuthenticationException();
        }
        return user;
      `
    },
    {
      name: 'put_',
      javaCode: `
        Object id = obj.getProperty("id");
        if ( id == null || getDelegate().find_(x, id) == null ) {
          checkOwnership(x, obj, getCreatePermission_());
        } else {
          checkOwnership(x, obj, getUpdatePermission_());
        }
        return super.put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
        FObject result = super.find_(x, id);
        if ( result != null ) {
          checkOwnership(x, result, getReadPermission_());
        }
        return super.find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
        DAO dao = getFilteredDAO(x, getReadPermission_());
        return dao.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        checkOwnership(x, obj, getRemovePermission_());
        return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        DAO dao = getFilteredDAO(x, getDeletePermission_());
        dao.removeAll_(x, skip, limit, order, predicate);
      `
    }
  ]
});
