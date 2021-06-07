/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'SystemAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.Group',
    'java.util.Map',
    'java.util.concurrent.ConcurrentHashMap',
    'javax.security.auth.AuthPermission',
    'static foam.mlang.MLang.TRUE'
  ],

  properties: [
    {
      class: 'Map',
      name: 'cache',
      javaType: 'Map<String, Boolean>',
      javaFactory: `
        return new ConcurrentHashMap<String, Boolean>();
      `
    }
  ],

  methods: [
    {
      name: 'init',
      javaCode: `
        DAO groupPermissionJunctionDAO = (DAO) getX().get("groupPermissionJunctionDAO");
        if ( groupPermissionJunctionDAO == null ) {
          return;
        }

        Map<String, Boolean> cache = ( Map<String, Boolean> ) getCache();
        groupPermissionJunctionDAO.listen(new Sink() {
          public void put(Object obj, Detachable sub) {
            cache.clear();
          }
          public void remove(Object obj, Detachable sub) {
            cache.clear();
          }
          public void eof() {
          }
          public void reset(Detachable sub) {
            cache.clear();
          }
        }, TRUE);
      `
    },
    {
      name: 'check',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        Group group = (Group) x.get("group");
        if ( user != null && user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID ) {
          return true;
        }

        return isAdmin(x, group) || getDelegate().check(x, permission);
      `
    },
    {
      name: 'isAdmin',
      javaType: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'group',
          type: 'foam.nanos.auth.Group'
        }
      ],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");

        if ( group == null ) {
          return false;
        }

        Map<String, Boolean> cache = getCache();
        var groupCache = cache.get(group.getId());
        if ( groupCache == null ) {
          boolean isSuper = auth.checkGroup(x, group.getId(), "*");
          cache.put(group.getId(), isSuper);
          return isSuper;
        }
        return groupCache;
      `
    }
  ]
});
