foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'SigningOfficerCapabilityInterceptPredicate',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: `Returns true if current 'agent' (user) has an signingofficerjunction with 'user' (business) `,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
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
        User agent = ((Subject) x.get("subject")).getRealUser();
        User user = ((Subject) x.get("subject")).getUser();

        if ( agent == null || user == null || ! ( agent instanceof User ) || ! ( user instanceof Business ) ) return false;

        BusinessUserJunction soJunction = (BusinessUserJunction) signingOfficerJunctionDAO.find(
          AND(
            EQ(BusinessUserJunction.SOURCE_ID, user.getId()),
            EQ(BusinessUserJunction.TARGET_ID, agent.getId())
          )
        );
        return soJunction != null ;
      `
    }
  ]
});
