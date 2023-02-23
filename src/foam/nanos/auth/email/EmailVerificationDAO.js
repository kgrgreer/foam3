/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'EmailVerificationDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User'
  ],

  javaCode: `
    public EmailVerificationDAO(X x, DAO delegate) {
      setX(x);
      setDelegate(delegate);
    }
  `,

  methods: [
    {
      name: 'put_',
      javaCode: `
        boolean newUser = getDelegate().find(((User) obj).getId()) == null;

        // send email verification if new user
        User result = (User) super.put_(x, obj);
        if ( result != null && newUser && ! result.getEmailVerified() ) {
          ((EmailVerificationService) x.get("emailVerificationService")).verifyByCode(x, result.getEmail(), result.getUserName(), "");
        }

        return result;
      `
    }
  ]
});
