foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'UserCompliancePassed',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if user compliance is passed.',

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      return AND(
        NEQ(DOT(OLD_OBJ, User.COMPLIANCE), ComplianceStatus.PASSED),
        EQ(DOT(NEW_OBJ, User.COMPLIANCE), ComplianceStatus.PASSED)
      ).f(obj);
      `
    }
  ]
});
