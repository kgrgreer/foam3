/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'AuthenticatedApprovalDAOAuthorizer',
  implements: ['foam.nanos.auth.Authorizer'],

  javaImports: [
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        if ( ! authService.check(x, "approval.create") ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        var approvalRequest = (ApprovalRequest) obj;
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null )
          throw new AuthorizationException();

        // The approval request is settled, anyone can see it
        if ( approvalRequest.getAssignedTo() == 0
          && approvalRequest.getStatus() != ApprovalStatus.REQUESTED
        ) return;

        // The approval request is in pending, only the approver can see it
        if ( ! canApprove(approvalRequest, user) )
          throw new AuthorizationException();
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        ApprovalRequest approvalRequest = (ApprovalRequest) oldObj;
        User user = ((Subject) x.get("subject")).getUser();
        AuthService authService = (AuthService) x.get("auth");
        if ( user == null || ! canApprove(approvalRequest, user) && ! isSystemOrAdminUser(user) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null || ! isSystemOrAdminUser(user) ) {
          throw new AuthorizationException("Approval can only be deleted by system");
        }
      `
    },
    {
      name: 'checkGlobalRead',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        return authService.check(x, "approval.read.*");
      `
    },
    {
      name: 'checkGlobalRemove',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        return authService.check(x, "approval.remove.*");
      `
    },
    {
      name: 'canApprove',
      type: 'Boolean',
      args: 'ApprovalRequest approvalRequest, User user',
      javaCode: `
        return approvalRequest.getApprover() == 0 ||
               approvalRequest.getApprover() == user.getId();
      `
    },
    {
      name: 'isSystemOrAdminUser',
      type: 'Boolean',
      args: 'User user',
      javaCode: `
        return user.getId() == User.SYSTEM_USER_ID ||
               "system".equals(user.getGroup()) ||
               "admin".equals(user.getGroup());
      `
    }
  ]
})
