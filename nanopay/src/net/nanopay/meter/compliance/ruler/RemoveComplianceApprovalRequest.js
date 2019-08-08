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
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalRequestUtil',
    'net.nanopay.approval.ApprovalStatus',
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
          if ( ApprovalRequestUtil.getStatus(x, request.getObjId(), request.getClassification()) == ApprovalStatus.REJECTED ) {
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
