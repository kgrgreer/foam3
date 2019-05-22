foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'UserComplianceApproval',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Updates user compliance according to related approval requests statuses.',

  javaImports: [
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        String objId = String.valueOf(obj.getProperty("id"));
        DAO dao = ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, "localUserDAO"),
            EQ(ApprovalRequest.OBJ_ID, objId)
          ));
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
