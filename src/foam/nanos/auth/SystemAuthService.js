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
    'javax.security.auth.AuthPermission'
  ],

  constants: [
    { name: 'CACHE_KEY', value: 'system.auth.cache' }
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
          Session session = x.get(Session.class);
          Boolean isSuper = (Boolean) session.getContext().get(CACHE_KEY);
          if ( isSuper == null ) {
            isSuper = group.implies(x, new AuthPermission("*"));
            session.setContext(session.getContext().put(CACHE_KEY, isSuper));
          }
          return isSuper || getDelegate().check(x, permission);
        }

        return getDelegate().check(x, permission);
      `
    }
  ]
});
