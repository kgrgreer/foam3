/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PaymentProviderCorridorAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  documentation: `
    Provides grouped access of corridors using single permissions based on provider given in permission string.
    ex.(paymentprovidercorridor.read.afex provides access to all AFEX payment provider corridors to the user granted the mentioned permission.)
    Id specific permissions such as paymentprovidercorridor.read.mycapstringid1234 will provide access to payment provider corridor matching the id
    in the id section of the permission string.
  `,

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException'
  ],

  properties: [
    {
      name: 'permissionPrefix',
      class: 'String',
    }
  ],

  methods: [
    {
      name: 'createPermission',
      args: [
        { name: 'op', class: 'String' },
        { name: 'paymentProvider', class: 'String' },
        { name: 'id', class: 'String' }
      ],
      type: 'String',
      documentation: `
       Returns a permission string based on "{ClassName}.{Operation}.{PaymentProvider}.{id}" or
       a variation using the last two permission identifiers.
      `,
      javaCode: `
        String permission = getPermissionPrefix() + "." + op;
        if ( paymentProvider != null ) permission += "." + paymentProvider.toLowerCase();
        if ( id != null ) permission += "." + id;
        return permission;
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode:  `
        String permission = createPermission("create", null, "*");
        AuthService authService = (AuthService) x.get("auth");
        if ( ! authService.check(x, permission) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode:  `
        String permission = createPermission("read", String.valueOf(obj.getProperty("provider")), String.valueOf(obj.getProperty("id")));
        String idPermission = createPermission("read", null, String.valueOf(obj.getProperty("id")));
        String paymentProviderPermission = createPermission("read", String.valueOf(obj.getProperty("provider")), null);
        AuthService authService = (AuthService) x.get("auth");
    
        if ( authService.check(x, permission) || authService.check(x, idPermission) || authService.check(x, paymentProviderPermission) ) {}
        else {
          throw new AuthorizationException();
        }      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode:  `
        String permission = createPermission("update", String.valueOf(oldObj.getProperty("provider")), String.valueOf(oldObj.getProperty("id")));
        String idPermission = createPermission("update", null, String.valueOf(oldObj.getProperty("id")));
        String paymentProviderPermission = createPermission("update", String.valueOf(oldObj.getProperty("provider")), null);
        AuthService authService = (AuthService) x.get("auth");
    
        if ( authService.check(x, permission) || authService.check(x, idPermission) || authService.check(x, paymentProviderPermission) ) {}
        else {
          throw new AuthorizationException();
        }      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode:  `
        String permission = createPermission("remove", String.valueOf(obj.getProperty("provider")), String.valueOf(obj.getProperty("id")));
        String idPermission  = createPermission("remove", null, String.valueOf(obj.getProperty("id")));
        String paymentProviderPermission = createPermission("remove", String.valueOf(obj.getProperty("provider")), null);

        AuthService authService = (AuthService) x.get("auth");
    
        if ( authService.check(x, permission) || authService.check(x, idPermission) || authService.check(x, paymentProviderPermission) ) {}
        else {
          throw new AuthorizationException();
        }
      `
    },
    { name: 'checkGlobalRead',
      javaCode: `
        String permission = createPermission("read", null, "*");
        AuthService authService = (AuthService) x.get("auth");
        try {
          return authService.check(x, permission);
        } catch ( AuthorizationException e ) {
          return false;
        }
      `
    },
    { name: 'checkGlobalRemove',
      javaCode: `
        String permission = createPermission("remove", null, "*");
        AuthService authService = (AuthService) x.get("auth");
        try {
          return authService.check(x, permission);
        } catch ( AuthorizationException e ) {
          return false;
        }
      `
    }
  ]
});
