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

  documentation: `Restrict login to the url that matches the spid of the user.`,


  javaImports: [
    'foam.dao.DAO',
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

        User user = (User) userDAO
          .find(
            AND(
              OR(
                EQ(User.EMAIL, identifier.toLowerCase()),
                EQ(User.USER_NAME, identifier)
              ),
              OR(
                EQ(User.SPID, ((Theme) x.get("theme")).getSpid()),
                EQ(User.SPID, getSuperSpid())
              )));

        if ( user == null ){
          throw new AuthenticationException("User not found.");
        }
        return user;
      `
    }
  ]
});
