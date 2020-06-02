foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BusinessHasNoSigningOfficers',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `Returns true if the business has no signing officer junctions`,

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessUserJunction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        X x = (X) obj;
        DAO signingOfficerJunctionDAO = (DAO) x.get("signingOfficerJunctionDAO");
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null || ! ( user instanceof Business ) ) return false;

        List<BusinessUserJunction> soJunction = ((ArraySink) signingOfficerJunctionDAO
          .where(EQ(BusinessUserJunction.SOURCE_ID, user.getId()))
          .select(new ArraySink()))
          .getArray();
        return soJunction.size() == 0;
      `
    }
  ]
});
  