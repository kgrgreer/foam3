foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'UserComplianceApproval',
  extends: 'net.nanopay.meter.compliance.ruler.AbstractComplianceApproval',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],
  documentation: 'Updates user compliance according to approval.',
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
