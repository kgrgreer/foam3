/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'FilterBySpidService',
  extends: 'foam.nanos.auth.ProxyUniqueUserService',
  flags: ['java'],

  documentation: 'Filter users by spid.',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.User',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'superSpid',
      documentation: 'Set spid of a theme that is accessible to all users'
    }
  ],

  methods: [
    {
      name: 'getUser',
      javaCode: `
        DAO userDAO = (DAO) x.get("localUserUserDAO");
        if ( userDAO == null ) {
          userDAO = (DAO) x.get("localUserDAO");
        }
        userDAO = userDAO
          .where(OR(
            EQ(User.SPID, ((Theme) ((Themes) x.get("themes")).findTheme(x)).getSpid()),
            EQ(User.SPID, getSuperSpid())));

        x = x.put("localUserUserDAO", userDAO);
        return getDelegate().getUser(x, identifier);
      `
    }
  ]
});
