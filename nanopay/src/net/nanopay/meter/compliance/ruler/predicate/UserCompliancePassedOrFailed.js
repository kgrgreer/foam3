foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'UserCompliancePassedOrFailed',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if user compliance is passed or failed.',

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return OR(
          EQ(DOT(NEW_OBJ, User.COMPLIANCE), ComplianceStatus.PASSED),
          EQ(DOT(NEW_OBJ, User.COMPLIANCE), ComplianceStatus.FAILED)
        ).f(obj);
      `
    }
  ]
});
