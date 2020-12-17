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
      name: 'createPermission'
    },
    {
      class: 'String',
      name: 'updatePermission'
    },
    {
      class: 'String',
      name: 'removePermission'
    },
    {
      class: 'String',
      name: 'readPermission'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AuthenticatedUserUserJunctionDAO(X x, String name, DAO delegate) {
            super(x, delegate);
            name = name.toLowerCase();
            setCreatePermission(name + ".create");
            setUpdatePermission(name + ".update.*");
            setRemovePermission(name + ".remove.*");
            setReadPermission(name + ".read.*");
          }
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'checkOwnership',
      visibility: 'protected',
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
      visibility: 'protected',
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
      visibility: 'protected',
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
          checkOwnership(x, obj, getCreatePermission());
        } else {
          checkOwnership(x, obj, getUpdatePermission());
        }
        return super.put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
        FObject result = super.find_(x, id);
        if ( result != null ) {
          checkOwnership(x, result, getReadPermission());
        }
        return super.find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
        DAO dao = getFilteredDAO(x, getReadPermission());
        return dao.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        checkOwnership(x, obj, getRemovePermission());
        return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        DAO dao = getFilteredDAO(x, getRemovePermission());
        dao.removeAll_(x, skip, limit, order, predicate);
      `
    }
  ]
});
