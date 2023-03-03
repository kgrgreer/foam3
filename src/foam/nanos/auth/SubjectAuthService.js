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
    'java.util.List',
    'java.util.HashMap',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'check',
      javaCode: `
        List<User> userPath = ((Subject) x.get("subject")).getUserPath();
        if ( userPath.size() == 0 ) return false;
        
        if ( getDelegate().check(x, permission) ) return true;

        if ( userPath.size() == 1 ) return false;

        if ( userPath.size() == 2 ) {
          if ( userPath.get(0).getId() == userPath.get(1).getId() ) {
            return false;
          }
        }

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
