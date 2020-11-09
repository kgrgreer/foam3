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
  package: 'net.nanopay.crunch.compliance',
  name: 'SetFulfilledComplianceApprovalRequest',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Updates user compliance according to approval.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;

            DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
            List<ApprovalRequest> fulfilledApprovals = ((ArraySink) approvalRequestDAO
              .where(AND(
                EQ(ApprovalRequest.DAO_KEY, "userCapabilityJunctionDAO"),
                EQ(ApprovalRequest.OBJ_ID, ucj.getId()),
                EQ(ApprovalRequest.IS_FULFILLED, false),
                OR(
                  EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED),
                  EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED)
                )
              )).select(new ArraySink()))
              .getArray();

            for ( ApprovalRequest ar : fulfilledApprovals ) {
              ar = (ApprovalRequest) ar.fclone();
              ar.setIsFulfilled(true);
              approvalRequestDAO.put(ar);
            }
          }
        }, "set isFulfilled to true on approved/rejected approval request");
      `
    }
  ]
});
