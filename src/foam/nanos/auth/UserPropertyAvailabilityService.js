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
        if ( ! targetProperty.equals("userName") &&
             ! targetProperty.equals("email")
        ) {
          throw new AuthorizationException();
        }
        
        Theme theme = (Theme) ((Themes) x.get("themes")).findTheme(x);
        var spid = theme.getSpid();

        if ( "email".equals(targetProperty) &&
             PreventDuplicateEmailAction.spidGrantsDuplicateEmailPermission(x, spid) ) {
          return true;
        }

        DAO userUserDAO = ((DAO) getX().get("localUserUserDAO")).inX(x);
        User user = (User) userUserDAO
          .find(AND(
            EQ(User.getOwnClassInfo().getAxiomByName(targetProperty), value),
            EQ(User.SPID, spid)));

        return user == null;
      `
    }
  ]
});
