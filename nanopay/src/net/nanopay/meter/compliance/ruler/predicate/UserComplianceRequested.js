foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'UserComplianceRequested',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if user compliance is requested',

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'static foam.mlang.MLang.*',
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'strict',
      value: false
    },
    {
      class: 'Class',
      name: 'of',
      javaFactory: 'return User.getOwnClassInfo();'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, getStrict()
            ? CLASS_OF(getOf().getObjClass())
            : INSTANCE_OF(User.class)), true),
          EQ(DOT(NEW_OBJ, User.COMPLIANCE), ComplianceStatus.REQUESTED)
        ).f(obj);
      `
    }
  ]
});
