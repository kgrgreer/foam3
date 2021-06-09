/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ThemeAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',
  flags: ['java'],

  documentation: `Restrict login to the url that matches the spid of the user.`,

  javaImports: [
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.util.Password',
    'foam.nanos.theme.Theme',
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
      name: 'login',
      javaCode: `
        return login_(x, identifier, password);
      `
    },
    {
      name: 'login_',
      documentation: 'Helper logic function to reduce code duplication.',
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
          type: 'String'
        }
      ],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = super.login(x, identifier, password);

        // Get theme's spid and user's spid
        Theme theme = ((Theme) x.get("theme"));
        String themeSpid = theme.getSpid();
        String userSpid = user.getSpid();

        // Check if theme's spid and user's spid matched.
        // if matched pass, else throw an error.
        // e.g., throws error: userSpid: "treviso", themeSpid: "intuit"
        if (
          user != null &&
          ! userSpid.equals(themeSpid) &&
          ! userSpid.equals(getSuperSpid())
        ) {
          auth.logout(x);
          throw new AuthenticationException("User not found");
        }

        return user;
      `
    }
  ]
});
