foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'UserComplianceApproval',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Updates user compliance according to related approval requests statuses.',

  javaImports: [
    'foam.mlang.sink.Count',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        DAO dao = ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, "localUserDAO"),
            EQ(ApprovalRequest.OBJ_ID, Long.toString(user.getId()))
          ));

        Count pending = (Count) dao.where(
          EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)
        ).select(new Count());
        if ( pending.getValue() > 0 ) {
          return;
        }

        Count rejected = (Count) dao.where(
          EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED)
        ).select(new Count());
        user.setCompliance(rejected.getValue() == 0
          ? ComplianceStatus.PASSED
          : ComplianceStatus.FAILED);
        ((DAO) x.get("localUserDAO")).put(user);
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: '//noop'
    },
    {
      name: 'canExecute',
      javaCode: 'return true;'
    },
    {
      name: 'describe',
      javaCode: 'return "";'
    }
  ]
});
