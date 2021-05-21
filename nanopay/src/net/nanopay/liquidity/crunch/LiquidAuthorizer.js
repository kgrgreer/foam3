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
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.account.ShadowAccount',
    'net.nanopay.liquidity.approvalRequest.AccountApprovableAware',
    'net.nanopay.tx.model.Transaction'
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
        { name: 'outgoingAccountId', class: 'String' }
      ],
      type: 'String',
      documentation: `
      Return a liquid specific permission string in the form of "{ClassName}.{Operation}.{outgoingAccountId}"
      `,
      javaCode: `
        String permission = permissionPrefix + "." + op;
        if ( ! foam.util.SafetyUtil.isEmpty(outgoingAccountId) ) permission += "." + outgoingAccountId;
        return permission;
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode:  `
        String accountId = obj instanceof AccountApprovableAware ? ((AccountApprovableAware) obj).getOutgoingAccountCreate(x) : "";
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

        String accountId =
          (
            obj instanceof AccountApprovableAware &&
            ! ( obj instanceof ShadowAccount )
          ) ?
          ((AccountApprovableAware) obj).getOutgoingAccountRead(x) :
          "";
        accountId = obj instanceof Transaction ? ((Transaction) obj).getOutgoingAccount() : accountId;

        if ( obj instanceof User ) {
          User userToRead = (User) obj;

          User currentUser = ((Subject) x.get("subject")).getUser();

          if ( userToRead.getId() == currentUser.getId() ) return;
        }

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
        String accountId = oldObj instanceof AccountApprovableAware ? ((AccountApprovableAware) oldObj).getOutgoingAccountUpdate(x) : "";
        accountId = oldObj instanceof Transaction ? ((Transaction) oldObj).getOutgoingAccount() : accountId;

        String permission = createPermission(getPermissionPrefix(), "make", accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( oldObj instanceof User ) {
          User userToRead = (User) oldObj;

          User currentUser = ((Subject) x.get("subject")).getUser();

          if ( userToRead.getId() == currentUser.getId() ) return;
        }

        if ( ! authService.check(x, permission) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode:  `
        String accountId = obj instanceof AccountApprovableAware ? ((AccountApprovableAware) obj).getOutgoingAccountDelete(x) : "";
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
