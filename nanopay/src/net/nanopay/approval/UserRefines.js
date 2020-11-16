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
      'approvalRequestDAO?'
    ],
    messages: [
      { name: 'APPROVAL_REQUESTS_MSG', message: 'Approval Requests for' }
    ],
    actions: [
      {
        name: 'viewApprovalRequests',
        label: 'View Approval Requests',
        availablePermissions: ['service.approvalRequestDAO', 'foam.nanos.auth.User.permission.viewApprovalRequests'],
        code: async function(X) {
          var m = foam.mlang.ExpressionsSingleton.create({});
          var dao = X.approvalRequestDAO.where(m.AND(
            m.EQ(foam.nanos.approval.ApprovalRequest.OBJ_ID, this.id),
            m.EQ(foam.nanos.approval.ApprovalRequest.DAO_KEY, 'localUserDAO')
          ));
          this.__context__.stack.push({
            class: 'foam.comics.v2.DAOBrowseControllerView',
            data: dao,
            config: {
              class: 'foam.comics.v2.DAOControllerConfig',
              dao: dao,
              createPredicate: foam.mlang.predicate.False,
              editPredicate: foam.mlang.predicate.True,
              browseTitle: `${this.APPROVAL_REQUESTS_MSG} ${this.toSummary()}`
            }
          });
        }
      }
    ]
});