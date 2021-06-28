/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserPropertyAvailabilityService',

  documentation:
    `This is a service that checks whether a user with matching values for a unique given property
    (restricted use for Username and Email) already exists in the system. Thus, this service allows the client to check
    the availability of these property values.
    `,

  implements: [
    'foam.nanos.auth.UserPropertyAvailabilityServiceInterface'
  ],

  imports: [
    'DAO localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'checkAvailability',
      javaCode: `
        if ( ! targetProperty.equals("userName") &&
             ! targetProperty.equals("email")
        ) {
          throw new AuthorizationException();
        }

        Theme theme = (Theme) ((Themes) x.get("themes")).findTheme(x);
        if ( targetProperty.equals("email") && theme.getAllowDuplicateEmails() ) {
          return true;
        }

        DAO userDAO = ((DAO) getX().get("localUserDAO")).inX(x);
        User user = (User) userDAO
          .find(AND(
            EQ(User.getOwnClassInfo().getAxiomByName(targetProperty), value),
            EQ(User.SPID, theme.getSpid())));

        if ( user != null ) {
          return false;
        }
        return true;
      `
    }
  ]
});
