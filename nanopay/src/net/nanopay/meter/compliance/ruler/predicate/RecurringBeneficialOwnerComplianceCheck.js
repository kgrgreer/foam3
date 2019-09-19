foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'RecurringBeneficialOwnerComplianceCheck',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: '',

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'foam.mlang.ContextObject',
    'foam.mlang.Expr',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        Expr isScheduledRule = new ContextObject("isScheduledRule");
        return AND(
          EQ(isScheduledRule, true),
          EQ(DOT(NEW_OBJ, BeneficialOwner.COMPLIANCE), ComplianceStatus.PASSED)
        ).f(obj);
      `
    }
  ]
});
