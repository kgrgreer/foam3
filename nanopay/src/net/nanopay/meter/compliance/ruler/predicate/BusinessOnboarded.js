foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'BusinessOnboarded',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
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
          EQ(DOT(NEW_OBJ, Business.ONBOARDED), true),
          EQ(DOT(OLD_OBJ, Business.ONBOARDED), false)
        ).f(obj);
      `
    }
  ]
});
