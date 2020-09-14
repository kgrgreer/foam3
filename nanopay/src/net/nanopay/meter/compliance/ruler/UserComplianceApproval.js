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
  name: 'UserComplianceApproval',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Updates user compliance according to approval.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            User user = (User) obj.fclone();
            DAO dao = ((DAO) x.get("approvalRequestDAO"))
              .where(AND(
                EQ(ApprovalRequest.SERVER_DAO_KEY, "localUserDAO"),
                EQ(ApprovalRequest.OBJ_ID, user.getId())
              ));

            ApprovalStatus approval = ApprovalRequestUtil.getState(dao);
            if ( approval != null && approval != ApprovalStatus.REQUESTED ) {
              user.setCompliance(ApprovalStatus.REJECTED == approval
                ? ComplianceStatus.FAILED
                // Approval can be null because no approval request is created
                // for the user e.g., when the user doesn't need further
                // approval. Hence, for a null or APPROVED approval, the user
                // compliance status is set to PASSED.
                : ComplianceStatus.PASSED);
              ((DAO) x.get("localUserDAO")).put(user);
            }
          }
        }, "User Compliance Approval");
      `
    }
  ]
});
