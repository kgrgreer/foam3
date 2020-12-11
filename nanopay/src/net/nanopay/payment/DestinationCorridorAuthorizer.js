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
  name: 'DestinationCorridorAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  documentation: `
    Provides grouped access of a users source corridors using permissions based destination type in permission string.
    Access to a source corridor signifies that a user can create account in the source country defined on the corridor along with source currencies.
    Access to a target corridor signifies that a user can create a contacts account account in the target country defined on the corridor along with target currencies.
    *To be implemented*: Target corridors should be considered when connected with other internal users and businesses.
    This was implemented to satisfy using corridors to define permitted account creations while sustaining the ability to grant other corridors required for multi legged transactions.
    ex.(paymentprovidercorridor.source.read.afex provides access to all AFEX payment provider corridors to the user granted the mentioned permission.)
    Id specific permissions such as paymentprovidercorridor.source.read.mycapstringid1234 will provide access to payment provider corridor matching the id
    in the id section of the permission string.
  `,

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException'
  ],

  properties: [
    {
      name: 'permissionPrefix',
      class: 'String'
    },
    {
      name: 'corridorType',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'createPermission',
      args: [
        { name: 'op', class: 'String' },
        { name: 'paymentProvider', class: 'Object' },
        { name: 'id', class: 'Object' }
      ],
      type: 'String',
      documentation: `
       Returns a permission string based on "{ClassName}.{CorridorType}.{Operation}.{PaymentProvider}.{id}" or
       a variation using the last two permission identifiers.
      `,
      javaCode: `
        String permission = getPermissionPrefix() + "." + getCorridorType() + "." + op;
        if ( paymentProvider != null ) permission += "." + String.valueOf(paymentProvider).toLowerCase();
        if ( id != null ) permission += "." + String.valueOf(id);
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
        String permission = createPermission("read", obj.getProperty("provider"), obj.getProperty("id"));
        String idPermission = createPermission("read", null, obj.getProperty("id"));
        String paymentProviderPermission = createPermission("read", obj.getProperty("provider"), null);
        AuthService authService = (AuthService) x.get("auth");
    
        if ( authService.check(x, permission) || authService.check(x, idPermission) || authService.check(x, paymentProviderPermission) ) {}
        else {
          throw new AuthorizationException();
        }      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode:  `
        String permission = createPermission("update", oldObj.getProperty("provider"), oldObj.getProperty("id"));
        String idPermission = createPermission("update", null, oldObj.getProperty("id"));
        String paymentProviderPermission = createPermission("update", oldObj.getProperty("provider"), null);
        AuthService authService = (AuthService) x.get("auth");
    
        if ( authService.check(x, permission) || authService.check(x, idPermission) || authService.check(x, paymentProviderPermission) ) {}
        else {
          throw new AuthorizationException();
        }      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode:  `
        String permission = createPermission("remove", obj.getProperty("provider"), obj.getProperty("id"));
        String idPermission  = createPermission("remove", null, obj.getProperty("id"));
        String paymentProviderPermission = createPermission("remove", obj.getProperty("provider"), null);

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
