/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
  ],

  properties: [
    {
      name: 'permissionPrefix',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'createPermission',
      args: [
        { name: 'op', class: 'String' },
        { name: 'id', class: 'Object' },
        { name: 'outgoingAccountId', class: 'Long' }
      ],
      type: 'String',
      documentation: `
      Return a liquid specific permission string in the form of "can{Operation}{ClassName}.{outgoingAccountId}"
      `,
      javaCode: `
        String permission = "can" + op + getPermissionPrefix();
        if ( outgoingAccountId >= 0 ) permission += "." + outgoingAccountId;
        return permission;

      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode:  `
        // Long accountId = obj instanceof ApprovableInterface ? ((ApprovableInterface) obj).getOutgoingAccountId() : -1;
        Long accountId = 0L;
        String permission = createPermission("Make", obj.getProperty("id"), accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, permission) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode:  `
        // Long accountId = obj instanceof ApprovableInterface ? ((ApprovableInterface) obj).getOutgoingAccountId() : -1;
        Long accountId = 0L;
        String readPermission = createPermission("View", obj.getProperty("id"), accountId);
        String approvePermission = createPermission("Approve", obj.getProperty("id"), accountId);
        String makePermission = createPermission("Make", obj.getProperty("id"), accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! ( authService.check(x, readPermission) || authService.check(x, approvePermission) || authService.check(x, makePermission) ) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode:  `
        // TODO if oldObj.getoutgoingaccount != newobj.getoutgoingaccount authorizeOncreate(x, newObj)
        authorizeOnCreate(x, oldObj);
        authorizeOnCreate(x, newObj);
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode:  `
        authorizeOnCreate(x, obj);
      `
    },
    { name: 'checkGlobalRead',
      javaCode: `
        return false;
      `
    },
    { name: 'checkGlobalRemove',
      javaCode: `
        return false;
      `
    }
  ]
})
