foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'IsRejectedComplianceApprovalRequest',

  documentation: 'Returns true if new object is a ComplianceApprovalRequest with status=REJECTED.',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, INSTANCE_OF(ComplianceApprovalRequest.class)), true),
          EQ(DOT(NEW_OBJ, ApprovalRequest.STATUS), ApprovalStatus.REJECTED)
        ).f(obj);
      `
    }
  ]
});
