foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidApprovalRequestAuthorizer',
  extends: 'net.nanopay.liquidity.crunch.LiquidAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
      'foam.nanos.auth.AuthorizationException',
      'foam.nanos.auth.AuthService',
      'net.nanopay.liquidity.approvalRequest.AccountRoleApprovalRequest',
      'net.nanopay.liquidity.approvalRequest.AccountApprovableAware'
    ],

  methods: [
    {
      name: 'createApprovePermission',
      args: [
        { name: 'className', class: 'String' },
        { name: 'outgoingAccountId', class: 'Long' }
      ],
      type: 'String',
      javaCode: `
        String permission = "canApprove";
        permission += className.substring(0, 1).toUpperCase() + className.substring(1);
        if ( outgoingAccountId > 0 ) permission += "." + outgoingAccountId;
        return permission;
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode:  `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("user");
        if ( user != null && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;

        // TODO: Yoyo fix this after
        AccountRoleApprovalRequest ar = (AccountRoleApprovalRequest) obj;

        Long accountId = ( obj instanceof AccountApprovableAware ) ? ((AccountApprovableAware) ar).getOutgoingAccountRead(x) : 0L;
        String className = ((foam.dao.DAO) x.get(ar.getDaoKey())).getOf().getClass().getSimpleName();

        String permission = createApprovePermission(className, accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, permission) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode:  `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("user");
        if ( user != null && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;

        // TODO: Yoyo fix this after
        AccountRoleApprovalRequest ar = (AccountRoleApprovalRequest) oldObj;

        Long accountId = ( oldObj instanceof AccountApprovableAware ) ? ((AccountApprovableAware) ar).getOutgoingAccountUpdate(x) : 0L;
        String className = ((foam.dao.DAO) x.get(ar.getDaoKey())).getOf().getClass().getSimpleName();

        String permission = createApprovePermission(className, accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, permission) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode:  `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("user");
        if ( user != null && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;
        throw new AuthorizationException("Approval requests can only be created by the system");
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode:  `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("user");
        if ( user != null && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;
        throw new AuthorizationException("Approval requests can only be created by the system");
      `
    }
  ]
})
  