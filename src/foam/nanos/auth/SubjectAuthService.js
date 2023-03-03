/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'SubjectAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'A decorator to check auth against every user in subject user path',

  javaImports: [
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.Auth',
    'java.util.Map',
    'java.util.HashMap'
  ],

  methods: [
    {
      name: 'check',
      javaCode: `
        if ( getDelegate().check(x, permission) ) return true;

        Map<Long, Boolean> seen = new HashMap<>();
        for ( User user : ((Subject) x.get("subject")).getUserPath() ) {
          if ( seen.containsKey(user.getId()) ) continue;

          if ( getDelegate().checkUser(x, user, permission) ) {
            return true;
          }

          seen.put(user.getId(), true);
        }

        return false;
      `
    }
  ]
});
