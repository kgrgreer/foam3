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

    'static foam.mlang.MLang.*',
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
        {// need this?
          name: 'password',
          class: 'String'
        }
      ],
      javaCode: `
        User user = (User) ((DAO) getLocalUserDAO());
        Theme theme = ((Theme) x.get("theme"));
        // should I think about "user == null || theme == null" statement?
        return getDelegate().where(
          OR(
            EQ(user.getSpid(), ((Theme) x.get("theme"))),
            EQ(user.getSpid(), getSuperSpid())
          ));
      `
    }
  ]
});
