foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact',
  name: 'CanadianUserPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, INSTANCE_OF(User.getOwnClassInfo()))    , true),
          EQ(DOT(NEW_OBJ, INSTANCE_OF(Business.getOwnClassInfo())), false),
          EQ(DOT(DOT(NEW_OBJ, User.ADDRESS), Address.COUNTRY_ID)  , "CA")
        ).f(obj);
      `
    }
  ]
});
