foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'UserComplianceApproval',
  extends: 'net.nanopay.meter.compliance.ruler.AbstractComplianceApproval',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Updates user compliance according to the last approved or
    rejected approval request.

    NOTE: UserComplianceApproval is not intended to be used with final rules
    (id: 1300, 1301) since when no approval request is created (e.g., because
    the user doesn't need further approval) the user compliance should be set
    to PASSED.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  properties: [
    {
      name: 'objDaoKey',
      value: 'localUserDAO'
    },
    {
      name: 'description',
      value: 'Setting user compliance status'
    }
  ],

  methods: [
    {
      name: 'updateObj',
      javaCode: `
        User user = (User) obj.fclone();
        user.setCompliance(
          ApprovalStatus.APPROVED == approvalStatus
            ? ComplianceStatus.PASSED
            : ComplianceStatus.FAILED);
        ((DAO) x.get(getObjDaoKey())).inX(x).put(user);
      `
    }
  ]
});
