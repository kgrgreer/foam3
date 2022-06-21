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
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.User',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'getUser',
      javaCode: `
        DAO userDAO = ((DAO) x.get("localUserUserDAO")).where(
          OR(
            EQ(User.EMAIL, identifier.toLowerCase()),
            EQ(User.USER_NAME, identifier)));

        // try to find a user under the theme spid
        List users = ((ArraySink) userDAO
          .where(EQ(User.SPID, ((Theme) ((Themes) x.get("themes")).findTheme(x)).getSpid()))
          .limit(2).select(new ArraySink())).getArray();
        if ( users.size() > 1 ) return null;
        if ( users.size() == 1 ) return (User) users.get(0);
        
        // try to find a user under the super spid
        // since the localuseruserdao here should be filtered by spid == themeSpid || spid == superspid
        users = ((ArraySink) userDAO.limit(2).select(new ArraySink())).getArray();
        if ( users.size() != 1 ) return null;
        return (User) users.get(0);
      `
    }
  ]
});
