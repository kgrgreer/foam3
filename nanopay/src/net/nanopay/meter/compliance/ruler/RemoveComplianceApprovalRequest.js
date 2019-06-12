foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'RemoveComplianceApprovalRequest',

  documentation: 'Rremoves all compliance approval requests for a specific user if one is rejected.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalRequestUtil',
    'net.nanopay.approval.ApprovalStatus',
    'static foam.mlang.MLang.*',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'foam.dao.DAO'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      ApprovalRequest request = (ApprovalRequest) obj;
      if ( ApprovalRequestUtil.getStatus(x, request.getObjId(), request.getClassification()) == ApprovalStatus.REJECTED ) {
        //remove all requested compliance approval requests for this specific object
        ((DAO)x.get("approvalRequestDAO")).where(AND(
          INSTANCE_OF(ComplianceApprovalRequest.class),
          EQ(ApprovalRequest.OBJ_ID, request.getObjId()),
          EQ(ApprovalRequest.DAO_KEY, request.getDaoKey())
          )
        ).removeAll();
      }
      `
    }
  ]
});
