/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
   package: 'foam.nanos.auth',
   name: 'FilterBySpidService',
   extends: 'foam.nanos.auth.ProxyUserLocatorService',
   flags: ['java'],

  documentation: `Filter users by email/username or spid.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.User',
    'foam.nanos.theme.Theme',
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
        DAO userDAO = (DAO) getX().get("localUserDAO");

        Sink sink = new ArraySink();
        sink = userDAO
          .where(OR(
            EQ(User.EMAIL, identifier.toLowerCase()),
            EQ(User.USER_NAME, identifier)
          )).limit(2).select(sink);

        List list = ((ArraySink) sink).getArray();
        if ( list.size() > 0 ) {
          userDAO = userDAO
            .where(OR(
              EQ(User.SPID, ((Theme) x.get("theme")).getSpid()),
              EQ(User.SPID, getSuperSpid())));
        }

        x = x.put("localUserDAO", userDAO);
        return getDelegate().getUser(x, identifier, password);
      `
    }
  ]
});

