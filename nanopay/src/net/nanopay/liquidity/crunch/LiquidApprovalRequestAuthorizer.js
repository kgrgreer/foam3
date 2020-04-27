foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidApprovalRequestAuthorizer',
  extends: 'net.nanopay.liquidity.crunch.LiquidAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalRequest',
    'net.nanopay.liquidity.approvalRequest.AccountRoleApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.dao.DAO'
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

        ApprovalRequest request = (ApprovalRequest) obj;

        // TODO: make this less ugly
        if ( ! (user.getId() == request.getApprover()) ) {

          if ( request.getStatus() == ApprovalStatus.APPROVED || request.getStatus() == ApprovalStatus.REJECTED ){
            if ( ! (request.getCreatedBy() == user.getId()) ){
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
        if ( user != null && 
             ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) && 
             ((ApprovalRequest) newObj).getIsFulfilled() ) 
          return;

        ApprovalRequest request = (ApprovalRequest) oldObj;
        ApprovalRequest newRequest = (ApprovalRequest) newObj;

        if ( ! (user.getId() == request.getApprover()) ) {
          throw new AuthorizationException("You are not the approver of this request");
        }

        if ( user.getId() == newRequest.getCreatedBy() && newRequest.getStatus() != foam.nanos.approval.ApprovalStatus.CANCELLED ){
          throw new AuthorizationException("You cannot approve or reject a request that you have initiated.");
        }

        if ( user.getId() != newRequest.getCreatedBy() && newRequest.getStatus() == foam.nanos.approval.ApprovalStatus.CANCELLED ){
          throw new AuthorizationException("You cannot cancel a request that you did not initiate.");
        }

        Long accountId = oldObj instanceof AccountRoleApprovalRequest ? ((AccountRoleApprovalRequest) oldObj).getOutgoingAccount() : 0;

        String className;
        if ( request.getOperation() == foam.nanos.ruler.Operations.UPDATE ) {
          String daoKey = ((Approvable) ((DAO) x.get("approvableDAO")).find(request.getObjId())).getDaoKey();
          className = ((DAO) x.get(daoKey)).getOf().getObjClass().getSimpleName().toLowerCase(); 
        } else {
          className = ((DAO) x.get(request.getDaoKey())).getOf().getObjClass().getSimpleName().toLowerCase();
        }
        
        String permission = createPermission(className, "approve", accountId);
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

        ApprovalRequest request = (ApprovalRequest) obj;

        Long accountId = obj instanceof AccountRoleApprovalRequest ? ((AccountRoleApprovalRequest) obj).getOutgoingAccount() : 0;

        String className;
        if ( request.getOperation() == foam.nanos.ruler.Operations.UPDATE ) {
          String daoKey = ((Approvable) ((DAO) x.get("approvableDAO")).find(request.getObjId())).getDaoKey();
          className = ((DAO) x.get(daoKey)).getOf().getObjClass().getSimpleName().toLowerCase(); 
        } else {
          className = ((DAO) x.get(request.getDaoKey())).getOf().getObjClass().getSimpleName().toLowerCase();
        }
        
        String permission = createPermission(className, "make", accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, permission) ) {
          throw new AuthorizationException();
        }
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
  
