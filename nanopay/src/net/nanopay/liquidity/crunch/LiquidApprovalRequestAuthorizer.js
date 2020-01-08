foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidApprovalRequestAuthorizer',
  extends: 'net.nanopay.liquidity.crunch.LiquidAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'net.nanopay.liquidity.approvalRequest.RoleApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
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

        RoleApprovalRequest request = (RoleApprovalRequest) obj;

        // TODO: make this less ugly
        if ( ! (user.getId() == request.getApprover()) ) {

          if ( request.getStatus() == ApprovalStatus.APPROVED || request.getStatus() == ApprovalStatus.REJECTED ){
            if ( ! (request.getInitiatingUser() == user.getId()) ){
              throw new AuthorizationException();
            }
          } else {
            throw new AuthorizationException();
          }
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode:  `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("user");
        if ( user != null && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;

        RoleApprovalRequest request = (RoleApprovalRequest) oldObj;

        if ( ! (user.getId() == request.getApprover()) ) {
          throw new AuthorizationException("You are not the approver of this request");
        }

        if ( user.getId() == request.getInitiatingUser() ){
          throw new AuthorizationException("You cannot approve your own request");
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
  