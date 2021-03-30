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
  name: 'LiquidApprovalRequestAuthorizer',
  extends: 'net.nanopay.liquidity.crunch.LiquidAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.liquidity.approvalRequest.AccountRoleApprovalRequest'
  ],

  methods: [
    {
      name: 'createApprovePermission',
      args: [
        { name: 'className', class: 'String' },
        { name: 'outgoingAccountId', class: 'String' }
      ],
      type: 'String',
      javaCode: `
        String permission = "canApprove";
        permission += className.substring(0, 1).toUpperCase() + className.substring(1);
        if ( ! foam.util.SafetyUtil.isEmpty(outgoingAccountId) ) permission += "." + outgoingAccountId;
        return permission;
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode:  `
        User user = ((Subject) x.get("subject")).getUser();
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
        Logger logger = (Logger) x.get("logger");
        AuthService auth = (AuthService) x.get("auth");
        boolean canApprove = auth.check(x, "liquid.approvable.requests");

        User user = ((Subject) x.get("subject")).getUser();
        if ( user != null &&
             canApprove &&
             ((ApprovalRequest) newObj).getIsFulfilled() )
          return;
        ApprovalRequest request = (ApprovalRequest) oldObj;
        ApprovalRequest newRequest = (ApprovalRequest) newObj;

        if ( user.getId() != request.getApprover() && ! canApprove ) {
          throw new AuthorizationException("You are not the approver of this request");
        }

        if ( user.getId() == newRequest.getCreatedBy() &&
          (
            newRequest.getStatus() == foam.nanos.approval.ApprovalStatus.APPROVED ||
            newRequest.getStatus() == foam.nanos.approval.ApprovalStatus.REJECTED
          )
        ){
          throw new AuthorizationException("You cannot approve or reject a request that you have initiated.");
        }

        if ( user.getId() != newRequest.getCreatedBy() && newRequest.getStatus() == foam.nanos.approval.ApprovalStatus.CANCELLED ){
          throw new AuthorizationException("You cannot cancel a request that you did not initiate.");
        }

        if ( user.getId() != newRequest.getCreatedBy() && newRequest.getStatus() == foam.nanos.approval.ApprovalStatus.REQUESTED ){
          throw new AuthorizationException("You cannot reset an already Approved, Rejected or Cancelled request back to Requested");
        }

        String accountId = oldObj instanceof AccountRoleApprovalRequest ? ((AccountRoleApprovalRequest) oldObj).getOutgoingAccount() : "";

        String daoKey = request.getDaoKey();
        if ( SafetyUtil.equals(request.getDaoKey(),"approvableDAO") ){
          daoKey = ((Approvable) ((DAO) x.get("approvableDAO")).find(request.getObjId())).getDaoKey();
        }

        String className = ((DAO) x.get(daoKey)).getOf().getObjClass().getSimpleName().toLowerCase();
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
        Logger logger = (Logger) x.get("logger");

        User user = ((Subject) x.get("subject")).getUser();
        if ( user != null && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;

        ApprovalRequest request = (ApprovalRequest) obj;

        String accountId = obj instanceof AccountRoleApprovalRequest ? ((AccountRoleApprovalRequest) obj).getOutgoingAccount() : "";

        String daoKey = request.getDaoKey();
        if ( SafetyUtil.equals(request.getDaoKey(),"approvableDAO") ){
          daoKey = ((Approvable) ((DAO) x.get("approvableDAO")).find(request.getObjId())).getDaoKey();
        }

        String className = ((DAO) x.get(daoKey)).getOf().getObjClass().getSimpleName().toLowerCase();
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
        User user = ((Subject) x.get("subject")).getUser();
        if ( user != null && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;
        throw new AuthorizationException("Approval requests can only be created by the system");
      `
    }
  ]
})

