/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'SubjectAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'A decorator to check auth against realUser if the check fails the first time',

  javaImports: [
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.Auth'
  ],

  methods: [
    {
      name: 'check',
      javaCode: `
        if ( getDelegate().check(x, permission) ) return true;

        User user = ((Subject) x.get("subject")).getUser();
        User realUser = ((Subject) x.get("subject)).getRealUser();

        if ( user.getId() == realUser.getId() ) return false;

        x = Auth.sudo(x, realUser);

        return getDelegate().check(x, permission);
      `
    }
  ]
});
