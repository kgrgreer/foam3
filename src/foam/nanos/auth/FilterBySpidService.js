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

  documentation: `Restrict login.....`,


  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.theme.Theme',
    'foam.nanos.auth.UserLocatorService',
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

        User user = (User) userDAO
          .find(
            OR(
              EQ(User.SPID, ((Theme) x.get("theme"))),
              EQ(User.SPID, getSuperSpid())
            ));

        if ( user != null ){
          throw new AuthenticationException("User not found.");
        }
        return user;
      `
    }
  ]
});
