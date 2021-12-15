/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PreventDuplicateEmailLoginService',
  extends: 'foam.nanos.auth.ProxyUniqueUserService',
  flags: ['java'],

  documentation: 'Prevent users from logging in with duplicate email',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.User',
    'foam.nanos.theme.Theme',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'getUser',
      javaCode: `
        DAO userDAO = (DAO) x.get("localUserUserDAO");
        Sink sink = new ArraySink();
        sink = userDAO
          .where(OR(
            EQ(User.EMAIL, identifier.toLowerCase()),
            EQ(User.USER_NAME, identifier)))
          .limit(2).select(sink);

        List list = ((ArraySink) sink).getArray();
        if ( list.size() != 1 ) {
          return null;
        }
        return (User) list.get(0);
      `
    }
  ]
});
