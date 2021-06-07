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
    },
    {
      class: 'Boolean',
      name: 'initialized'
    }
  ],

  methods: [
    {
      name: 'initCache',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      javaCode: `
        if ( getInitialized() ) {
          return;
        }

        DAO groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");
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
        setInitialized(true);
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

        // Response from group implies is cached to maintain intended performance.
        if ( group != null ) {
          this.initCache(x);
          Map<String, Boolean> cache = getCache();
          var groupCache = cache.get(group.getId());
          if ( groupCache == null ) {
            boolean isSuper = group.implies(x, new AuthPermission("*"));
            cache.put(group.getId(), isSuper);
            return isSuper || getDelegate().check(x, permission);
          }
          return groupCache || getDelegate().check(x, permission);
        }
        return getDelegate().check(x, permission);
      `
    }
  ]
});
