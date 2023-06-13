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
    'static foam.mlang.MLang.*',

    'foam.nanos.auth.ruler.PreventDuplicateEmailAction'
  ],

  methods: [
    {
      name: 'checkAvailability',
      javaCode: `
        if ( getX().get("crunchService") == null ||
             ( ! targetProperty.equals("username") &&
               ! targetProperty.equals("email") )
        ) {
          throw new AuthorizationException();
        }
        
        Theme theme = (Theme) ((Themes) x.get("themes")).findTheme(x);
        var spid = theme.getSpid();
        if ( "email".equals(targetProperty) &&
             PreventDuplicateEmailAction.spidGrantsDuplicateEmailPermission(getX(), spid) ) {
            return true;
        }

        DAO userDAO = ((DAO) getX().get("localUserDAO")).inX(x);
        return
          (
            userDAO
            .find(AND(
              EQ("email".equals(targetProperty) ? User.EMAIL : User.USER_NAME, value),
              EQ(User.TYPE, "User"),
              EQ(User.SPID, spid)))
          ) == null;
      `
    }
  ]
});
