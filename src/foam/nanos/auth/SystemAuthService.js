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
    'foam.nanos.auth.Group',
    'foam.nanos.session.Session',
    'javax.security.auth.AuthPermission',
    'java.util.Map',
    'java.util.concurrent.ConcurrentHashMap',
  ],

  properties: [
    {
      class: 'Map',
      name: 'cache',
      javaFactory: `
        return new ConcurrentHashMap<String, Boolean>();
      `
    }
  ],

  methods: [
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
          Map<String, Boolean> cache = ( Map<String, Boolean> ) getCache();
          if ( cache.get(group.getId()) == null ) {
            boolean isSuper = group.implies(x, new AuthPermission("*"));
            cache.put(group.getId(), isSuper);
            return isSuper || getDelegate().check(x, permission);
          }
          return cache.get(group.getId()) || getDelegate().check(x, permission);
        }
        return getDelegate().check(x, permission);
      `
    }
  ]
});
