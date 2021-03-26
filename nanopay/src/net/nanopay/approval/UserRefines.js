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
        availablePermissions: ['service.approvalRequestDAO', 'foam.nanos.auth.User.permission.viewApprovalRequests'],
        code: async function(X) {
          var m = foam.mlang.ExpressionsSingleton.create({});
          this.__context__.stack.push({
            class: 'foam.comics.BrowserView',
            createEnabled: false,
            editEnabled: true,
            exportEnabled: true,
            title: `${this.organization}'s Approval Requests`,
            data: X.approvalRequestDAO.where(m.AND(
              m.EQ(foam.nanos.approval.ApprovalRequest.OBJ_ID, this.id),
              m.EQ(foam.nanos.approval.ApprovalRequest.SERVER_DAO_KEY, 'localUserDAO')
            ))
          });
        }
      }
    ]
});