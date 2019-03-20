foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact',
  name: 'CanadianBusinessOnboarding',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.auth.Address',
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
          EQ(DOT(NEW_OBJ, INSTANCE_OF(Business.getOwnClassInfo())), true),
          EQ(DOT(DOT(NEW_OBJ, User.ADDRESS), Address.COUNTRY_ID)  , "CA"),
          EQ(DOT(NEW_OBJ, User.COMPLIANCE), ComplianceStatus.REQUESTED),
          NEQ(DOT(OLD_OBJ, User.COMPLIANCE), ComplianceStatus.REQUESTED)
        ).f(obj);
      `
    }
  ]
});
