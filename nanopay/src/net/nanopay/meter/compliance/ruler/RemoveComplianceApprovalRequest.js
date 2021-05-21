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
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'RemoveComplianceApprovalRequest',

  documentation: 'Removes pending compliance approval requests for a specific user if one is rejected.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          ApprovalRequest request = (ApprovalRequest) obj;
          if ( ApprovalRequestUtil.getStatus(x, request.getObjId(), request.getClassificationEnum()) == ApprovalStatus.REJECTED ) {
            // remove all requested compliance approval requests for this specific object
            ((DAO)x.get("approvalRequestDAO")).where(
              AND(
                INSTANCE_OF(ComplianceApprovalRequest.class),
                EQ(ApprovalRequest.OBJ_ID, request.getObjId()),
                EQ(ApprovalRequest.DAO_KEY, request.getDaoKey()),
                EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)
              )
            ).removeAll();
          }
        }
      }, "Remove Compliance Approval Request");
      `
    }
  ]
});
