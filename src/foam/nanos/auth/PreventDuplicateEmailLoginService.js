/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
   package: 'foam.nanos.auth',
   name: 'PreventDuplicateEmailLoginService',
   extends: 'foam.nanos.auth.ProxyUserLocatorService',
   flags: ['java'],

  documentation: 'Prevent users from logging in with duplicate email',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.User',
    'foam.nanos.theme.Theme',

    'java.util.List',

    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'superSpid',
      documentation: 'Set spid of a theme that is accessible to all users',
      value: "",
    }
  ],

  methods: [
    {
      name: 'getUser',
      documentation: 'Helper logic function to reduce code duplication',
      type: 'User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'identifier',
          type: 'String'
        },
        {
          name: 'password',
          class: 'String'
        }
      ],
      javaCode: `
        DAO userDAO = (DAO) getX().get("localUserDAO");

        Sink sink = new ArraySink();
        sink = userDAO
          .where(
            OR(
              EQ(User.EMAIL, identifier.toLowerCase()),
              EQ(User.USER_NAME, identifier)
            ))
          .select(sink);
        List list = ((ArraySink) sink).getArray();

        if ( list != null ){
          if ( list.size() == 0 ) {
            throw new AuthenticationException("User not found.");
          } else if ( list.size() > 1 ) {
            throw new AuthenticationException("Duplicate Email.");
          }
        }
        return (User) list.get(0);
      `
    }
  ]
});
