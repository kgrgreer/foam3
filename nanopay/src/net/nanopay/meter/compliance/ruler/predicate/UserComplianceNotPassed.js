foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'UserComplianceNotPassed',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if user compliance is moved from passed to not passed.',

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      return AND(
        EQ(DOT(NEW_OBJ, INSTANCE_OF(Business.class)), true),
        EQ(DOT(OLD_OBJ, Business.COMPLIANCE), ComplianceStatus.PASSED),
        NEQ(DOT(NEW_OBJ, Business.COMPLIANCE), ComplianceStatus.PASSED)
      ).f(obj);
      `
    }
  ]
});
