foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'net.nanopay.account.Account',
    'net.nanopay.account.ShadowAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.liquidity.approvalRequest.AccountApprovableAware',
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
        { name: 'permissionPrefix', class: 'String' },
        { name: 'op', class: 'String' },
        { name: 'outgoingAccountId', class: 'Long' }
      ],
      type: 'String',
      documentation: `
      Return a liquid specific permission string in the form of "{ClassName}.{Operation}.{outgoingAccountId}"
      `,
      javaCode: `
        String permission = permissionPrefix + "." + op;
        if ( outgoingAccountId > 0 ) permission += "." + outgoingAccountId;
        return permission;
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode:  `
        Long accountId = obj instanceof AccountApprovableAware ? ((AccountApprovableAware) obj).getOutgoingAccountCreate(x) : 0;
        accountId = obj instanceof Transaction ? ((Transaction) obj).getOutgoingAccount() : accountId;

        String permission = createPermission(getPermissionPrefix(), "make", accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, permission) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode:  `

        AuthService authService = (AuthService) x.get("auth");

        String permissionPrefix = obj instanceof ShadowAccount ? "shadowaccount" : getPermissionPrefix();

        Long accountId =
          (
            obj instanceof AccountApprovableAware &&
            ! ( obj instanceof ShadowAccount )
          ) ?
          ((AccountApprovableAware) obj).getOutgoingAccountRead(x) :
          0;
        accountId = obj instanceof Transaction ? ((Transaction) obj).getOutgoingAccount() : accountId;

        if ( ! (
          authService.check(x, createPermission(permissionPrefix, "view",    accountId)) ||
          authService.check(x, createPermission(permissionPrefix, "approve", accountId)) ||
          authService.check(x, createPermission(permissionPrefix, "make",    accountId)) ) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode:  `
        Long accountId = oldObj instanceof AccountApprovableAware ? ((AccountApprovableAware) oldObj).getOutgoingAccountUpdate(x) : 0;
        accountId = oldObj instanceof Transaction ? ((Transaction) oldObj).getOutgoingAccount() : accountId;

        String permission = createPermission(getPermissionPrefix(), "make", accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, permission) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode:  `
        Long accountId = obj instanceof AccountApprovableAware ? ((AccountApprovableAware) obj).getOutgoingAccountDelete(x) : 0;
        accountId = obj instanceof Transaction ? ((Transaction) obj).getOutgoingAccount() : accountId;

        String permission = createPermission(getPermissionPrefix(), "make", accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, permission) ) {
          throw new AuthorizationException();
        }
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
