foam.CLASS({
    package: 'net.nanopay.approval',
    name: 'UserRefines',
    refines: 'foam.nanos.auth.User',
    imports: [
      'approvalRequestDAO'
    ],
    actions: [
      {
        name: 'viewApprovalRequests',
        label: 'View Approval Requests',
        availablePermissions: ['service.approvalrequestdao', 'foam.nanos.auth.User.permission.viewApprovalRequests'],
        code: async function(X) {
          var m = foam.mlang.ExpressionsSingleton.create({});
          this.__context__.stack.push({
            class: 'foam.comics.BrowserView',
            createEnabled: false,
            editEnabled: true,
            exportEnabled: true,
            title: `${this.organization}'s Approval Requests`,
            data: X.approvalRequestDAO.where(m.AND(
              m.EQ(net.nanopay.approval.ApprovalRequest.OBJ_ID, this.id),
              m.EQ(net.nanopay.approval.ApprovalRequest.DAO_KEY, 'localUserDAO')
            ))
          });
        }
      }
    ]
});